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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
	const queryClient = useQueryClient();
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

	const devices = useQuery({
		...orpc.admin.pushSubscription.list.queryOptions(),
		enabled: isAdmin,
	});

	const users = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const result = await authClient.admin.listUsers({
				query: { limit: 50, sortBy: "createdAt", sortDirection: "desc" },
			});
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		enabled: isAdmin,
	});
	const invalidateUsers = () =>
		queryClient.invalidateQueries({ queryKey: ["admin-users"] });

	const toggleRole = useMutation({
		mutationFn: async ({
			userId,
			role,
		}: {
			userId: string;
			role: "admin" | "user";
		}) => {
			const result = await authClient.admin.setRole({ userId, role });
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		onSuccess: invalidateUsers,
	});
	const banUser = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.banUser({ userId });
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		onSuccess: invalidateUsers,
	});
	const unbanUser = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.unbanUser({ userId });
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		onSuccess: invalidateUsers,
	});

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

			<Card className="mb-6">
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

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Người dùng</CardTitle>
					<CardDescription>
						Bao gồm cả người dùng ẩn danh (chỉ đăng ký nhận thông báo)
					</CardDescription>
				</CardHeader>
				<CardContent>
					{users.isLoading ? (
						<p className="text-muted-foreground">Đang tải...</p>
					) : users.data?.users.length === 0 ? (
						<p className="text-muted-foreground">Chưa có người dùng nào.</p>
					) : (
						<ul className="space-y-2">
							{users.data?.users.map((user) => (
								<li
									key={user.id}
									className="flex items-center justify-between border-b pb-2 text-sm"
								>
									<div>
										<span className="font-medium">
											{(user as { isAnonymous?: boolean }).isAnonymous
												? "Người dùng ẩn danh"
												: user.email}
										</span>
										{user.banned ? (
											<span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-red-600 text-xs dark:text-red-400">
												Đã khóa
											</span>
										) : null}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="xs"
											disabled={toggleRole.isPending}
											onClick={() =>
												toggleRole.mutate({
													userId: user.id,
													role: user.role === "admin" ? "user" : "admin",
												})
											}
										>
											{user.role === "admin"
												? "Bỏ quyền admin"
												: "Cấp quyền admin"}
										</Button>
										<Button
											variant="outline"
											size="xs"
											disabled={banUser.isPending || unbanUser.isPending}
											onClick={() =>
												user.banned
													? unbanUser.mutate(user.id)
													: banUser.mutate(user.id)
											}
										>
											{user.banned ? "Mở khóa" : "Khóa"}
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Thiết bị nhận thông báo</CardTitle>
					<CardDescription>
						Danh sách push subscription đã đăng ký
					</CardDescription>
				</CardHeader>
				<CardContent>
					{devices.isLoading ? (
						<p className="text-muted-foreground">Đang tải...</p>
					) : devices.data?.length === 0 ? (
						<p className="text-muted-foreground">
							Chưa có thiết bị nào đăng ký.
						</p>
					) : (
						<ul className="space-y-2">
							{devices.data?.map((device) => (
								<li
									key={device.id}
									className="flex items-center justify-between border-b pb-2 text-sm"
								>
									<span>
										{device.user.isAnonymous ? "Ẩn danh" : device.user.email}
									</span>
									<span className="text-muted-foreground">
										{device.bridges.length === 0
											? "Tất cả các cầu"
											: device.bridges.map((bridge) => bridge.name).join(", ")}
									</span>
									<span className="text-muted-foreground">
										{new Date(device.createdAt).toLocaleString("vi-VN")}
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
