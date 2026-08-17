import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

import type { Route } from "./+types/admin";

const BRIDGE_STATUS_LABEL: Record<string, string> = {
	SAFE: "An toàn",
	WARNING: "Cảnh báo",
	DANGER: "Nguy hiểm",
};

const SENSOR_STATUS_LABEL: Record<string, string> = {
	ONLINE: "Đang hoạt động",
	OFFLINE: "Mất kết nối",
	NEVER: "Chưa có dữ liệu",
};

const SENSOR_STATUS_CLASS: Record<string, string> = {
	ONLINE: "bg-green-500/15 text-green-600 dark:text-green-400",
	OFFLINE: "bg-red-500/15 text-red-600 dark:text-red-400",
	NEVER: "bg-muted text-muted-foreground",
};

export function meta(_: Route.MetaArgs) {
	return [{ title: "Quản trị cầu tràn" }];
}

export default function Admin() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const isAdmin = session?.user.role === "admin";

	useEffect(() => {
		if (!session && !isPending) navigate("/login");
	}, [session, isPending, navigate]);

	const bridges = useQuery({
		...orpc.admin.bridge.list.queryOptions(),
		enabled: isAdmin,
	});
	const alerts = useQuery({
		...orpc.admin.alertHistory.list.queryOptions({ input: {} }),
		enabled: isAdmin,
	});

	const createBridge = useMutation(
		orpc.admin.bridge.create.mutationOptions({
			onSuccess: () => bridges.refetch(),
		}),
	);
	const upsertThreshold = useMutation(
		orpc.admin.threshold.upsert.mutationOptions({
			onSuccess: () => bridges.refetch(),
		}),
	);
	const deleteBridge = useMutation(
		orpc.admin.bridge.delete.mutationOptions({
			onSuccess: () => {
				bridges.refetch();
				alerts.refetch();
			},
		}),
	);

	function handleCreateBridge(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const location = String(formData.get("location") ?? "").trim();
		if (!name) return;
		createBridge.mutate({ name, location: location || undefined });
		e.currentTarget.reset();
	}

	function handleUpsertThreshold(
		bridgeId: string,
		e: FormEvent<HTMLFormElement>,
	) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const safeMax = Number(formData.get("safeMax"));
		const warningMax = Number(formData.get("warningMax"));
		if (Number.isNaN(safeMax) || Number.isNaN(warningMax)) return;
		upsertThreshold.mutate({ bridgeId, safeMax, warningMax });
	}

	if (isPending) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-6">Đang tải...</div>
		);
	}

	if (!session) {
		return null;
	}

	if (!isAdmin) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-6">
				<p className="text-muted-foreground">
					Bạn không có quyền truy cập trang quản trị.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-6">
			<h1 className="mb-4 font-semibold text-2xl">Quản trị cầu tràn</h1>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Thêm cầu mới</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleCreateBridge}
						className="flex flex-wrap items-end gap-2"
					>
						<div className="grid gap-1">
							<Label htmlFor="name">Tên cầu</Label>
							<Input id="name" name="name" required />
						</div>
						<div className="grid gap-1">
							<Label htmlFor="location">Khu vực</Label>
							<Input id="location" name="location" />
						</div>
						<Button type="submit" disabled={createBridge.isPending}>
							{createBridge.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Thêm"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			<div className="mb-6 grid gap-4">
				{bridges.isLoading ? (
					<p className="text-muted-foreground">Đang tải danh sách cầu...</p>
				) : bridges.data?.length === 0 ? (
					<p className="text-muted-foreground">Chưa có cầu nào.</p>
				) : (
					bridges.data?.map((bridge) => (
						<Card key={bridge.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>{bridge.name}</CardTitle>
									{bridge.location ? (
										<CardDescription>{bridge.location}</CardDescription>
									) : null}
								</div>
								<div className="flex items-center gap-2">
									<span
										className={`rounded-full px-3 py-1 font-medium text-sm ${SENSOR_STATUS_CLASS[bridge.sensorStatus]}`}
									>
										{SENSOR_STATUS_LABEL[bridge.sensorStatus]}
									</span>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Xóa cầu"
										onClick={() => deleteBridge.mutate({ id: bridge.id })}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={(e) => handleUpsertThreshold(bridge.id, e)}
									className="flex flex-wrap items-end gap-2"
								>
									<div className="grid gap-1">
										<Label htmlFor={`safeMax-${bridge.id}`}>
											Ngưỡng an toàn (m)
										</Label>
										<Input
											id={`safeMax-${bridge.id}`}
											name="safeMax"
											type="number"
											step="0.01"
											defaultValue={bridge.threshold?.safeMax}
											required
										/>
									</div>
									<div className="grid gap-1">
										<Label htmlFor={`warningMax-${bridge.id}`}>
											Ngưỡng cảnh báo (m)
										</Label>
										<Input
											id={`warningMax-${bridge.id}`}
											name="warningMax"
											type="number"
											step="0.01"
											defaultValue={bridge.threshold?.warningMax}
											required
										/>
									</div>
									<Button
										type="submit"
										variant="outline"
										disabled={upsertThreshold.isPending}
									>
										Lưu ngưỡng
									</Button>
								</form>
								{bridge.latestReading ? (
									<p className="mt-2 text-muted-foreground text-sm">
										Mực nước gần nhất: {bridge.latestReading.level} m · Cập nhật
										lúc{" "}
										{new Date(bridge.latestReading.recordedAt).toLocaleString(
											"vi-VN",
										)}
									</p>
								) : null}
							</CardContent>
						</Card>
					))
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Lịch sử cảnh báo gần đây</CardTitle>
				</CardHeader>
				<CardContent>
					{alerts.isLoading ? (
						<p className="text-muted-foreground">Đang tải...</p>
					) : alerts.data?.length === 0 ? (
						<p className="text-muted-foreground">Chưa có cảnh báo nào.</p>
					) : (
						<ul className="space-y-2">
							{alerts.data?.map((alert) => (
								<li
									key={alert.id}
									className="flex items-center justify-between border-b pb-2 text-sm"
								>
									<span>{alert.bridge.name}</span>
									<span>{BRIDGE_STATUS_LABEL[alert.status]}</span>
									<span className="text-muted-foreground">
										{new Date(alert.createdAt).toLocaleString("vi-VN")}
									</span>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
