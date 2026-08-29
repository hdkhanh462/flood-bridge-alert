import { Badge } from "@flood-bridge-alert/ui/components/badge";
import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@flood-bridge-alert/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@flood-bridge-alert/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@flood-bridge-alert/ui/components/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { SensorStatusBadge, StatusBadge } from "@/components/status-badge";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

type AdminBridge = NonNullable<
	ReturnType<typeof useAdminBridges>["data"]
>[number];

function useAdminBridges(enabled: boolean) {
	return useQuery({ ...orpc.admin.bridge.list.queryOptions(), enabled });
}

export default function Admin() {
	useDocumentTitle("Quản trị cầu tràn");
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isAdmin = session?.user.role === "admin";

	useEffect(() => {
		if (!session && !isPending) navigate("/login");
	}, [session, isPending, navigate]);

	const bridges = useAdminBridges(isAdmin);
	const alerts = useQuery({
		...orpc.admin.alertHistory.list.queryOptions({ input: {} }),
		enabled: isAdmin,
	});
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

	const [addOpen, setAddOpen] = useState(false);
	const [editingBridge, setEditingBridge] = useState<AdminBridge | null>(null);

	function handleCreateBridge(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const location = String(formData.get("location") ?? "").trim();
		if (!name) return;
		createBridge.mutate(
			{ name, location: location || undefined },
			{ onSuccess: () => setAddOpen(false) },
		);
	}

	function handleUpsertThreshold(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!editingBridge) return;
		const formData = new FormData(e.currentTarget);
		const safeMax = Number(formData.get("safeMax"));
		const warningMax = Number(formData.get("warningMax"));
		if (Number.isNaN(safeMax) || Number.isNaN(warningMax)) return;
		upsertThreshold.mutate(
			{ bridgeId: editingBridge.id, safeMax, warningMax },
			{ onSuccess: () => setEditingBridge(null) },
		);
	}

	if (isPending) {
		return (
			<div className="container mx-auto max-w-5xl px-4 py-6">
				<Skeleton className="h-8 w-64" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	if (!isAdmin) {
		return (
			<div className="container mx-auto max-w-5xl px-4 py-16">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ShieldAlert />
						</EmptyMedia>
						<EmptyTitle>Không có quyền truy cập</EmptyTitle>
						<EmptyDescription>
							Bạn cần quyền quản trị viên để xem trang này.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl px-4 py-6 sm:py-10">
			<h1 className="mb-6 font-semibold text-2xl tracking-tight">
				Quản trị cầu tràn
			</h1>

			<Tabs defaultValue="bridges">
				<TabsList className="mb-4">
					<TabsTrigger value="bridges">Cầu & ngưỡng</TabsTrigger>
					<TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
					<TabsTrigger value="users">Người dùng</TabsTrigger>
					<TabsTrigger value="devices">Thiết bị</TabsTrigger>
				</TabsList>

				<TabsContent value="bridges">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Danh sách cầu</CardTitle>
								<CardDescription>
									Quản lý cầu tràn và ngưỡng cảnh báo
								</CardDescription>
							</div>
							<Dialog open={addOpen} onOpenChange={setAddOpen}>
								<DialogTrigger render={<Button size="sm" />}>
									<Plus className="h-4 w-4" />
									Thêm cầu
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Thêm cầu mới</DialogTitle>
									</DialogHeader>
									<form
										id="create-bridge-form"
										onSubmit={handleCreateBridge}
										className="grid gap-4"
									>
										<div className="grid gap-2">
											<Label htmlFor="name">Tên cầu</Label>
											<Input id="name" name="name" required />
										</div>
										<div className="grid gap-2">
											<Label htmlFor="location">Khu vực</Label>
											<Input id="location" name="location" />
										</div>
									</form>
									<DialogFooter>
										<Button
											type="submit"
											form="create-bridge-form"
											disabled={createBridge.isPending}
										>
											{createBridge.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												"Thêm"
											)}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							{bridges.isLoading ? (
								<Skeleton className="h-32 w-full" />
							) : bridges.data?.length === 0 ? (
								<Empty>
									<EmptyHeader>
										<EmptyTitle>Chưa có cầu nào</EmptyTitle>
										<EmptyDescription>
											Bấm "Thêm cầu" để bắt đầu.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tên cầu</TableHead>
											<TableHead>Cảm biến</TableHead>
											<TableHead>Ngưỡng</TableHead>
											<TableHead className="text-right">Hành động</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{bridges.data?.map((bridge) => (
											<TableRow key={bridge.id}>
												<TableCell>
													<div className="font-medium">{bridge.name}</div>
													{bridge.location ? (
														<div className="text-muted-foreground text-xs">
															{bridge.location}
														</div>
													) : null}
												</TableCell>
												<TableCell>
													<SensorStatusBadge status={bridge.sensorStatus} />
												</TableCell>
												<TableCell className="text-muted-foreground">
													{bridge.threshold ? (
														<>
															An toàn ≤ {bridge.threshold.safeMax}m · Cảnh báo ≤{" "}
															{bridge.threshold.warningMax}m
														</>
													) : (
														"Chưa cấu hình"
													)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Sửa ngưỡng"
														onClick={() => setEditingBridge(bridge)}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Xóa cầu"
														onClick={() =>
															deleteBridge.mutate({ id: bridge.id })
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="alerts">
					<Card>
						<CardHeader>
							<CardTitle>Lịch sử cảnh báo gần đây</CardTitle>
						</CardHeader>
						<CardContent>
							{alerts.isLoading ? (
								<Skeleton className="h-32 w-full" />
							) : alerts.data?.length === 0 ? (
								<Empty>
									<EmptyHeader>
										<EmptyTitle>Chưa có cảnh báo nào</EmptyTitle>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Cầu</TableHead>
											<TableHead>Trạng thái</TableHead>
											<TableHead className="text-right">Thời gian</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{alerts.data?.map((alert) => (
											<TableRow key={alert.id}>
												<TableCell>{alert.bridge.name}</TableCell>
												<TableCell>
													<StatusBadge status={alert.status} />
												</TableCell>
												<TableCell className="text-right text-muted-foreground">
													{new Date(alert.createdAt).toLocaleString("vi-VN")}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="users">
					<Card>
						<CardHeader>
							<CardTitle>Người dùng</CardTitle>
							<CardDescription>
								Bao gồm cả người dùng ẩn danh (chỉ đăng ký nhận thông báo)
							</CardDescription>
						</CardHeader>
						<CardContent>
							{users.isLoading ? (
								<Skeleton className="h-32 w-full" />
							) : users.data?.users.length === 0 ? (
								<Empty>
									<EmptyHeader>
										<EmptyTitle>Chưa có người dùng nào</EmptyTitle>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Người dùng</TableHead>
											<TableHead>Vai trò</TableHead>
											<TableHead className="text-right">Hành động</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.data?.users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div className="font-medium">
														{(user as { isAnonymous?: boolean }).isAnonymous
															? "Người dùng ẩn danh"
															: user.email}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Badge
															variant={
																user.role === "admin" ? "default" : "secondary"
															}
														>
															{user.role === "admin" ? "Admin" : "Người dùng"}
														</Badge>
														{user.banned ? (
															<Badge variant="destructive">Đã khóa</Badge>
														) : null}
													</div>
												</TableCell>
												<TableCell className="text-right">
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
													</Button>{" "}
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
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="devices">
					<Card>
						<CardHeader>
							<CardTitle>Thiết bị nhận thông báo</CardTitle>
							<CardDescription>
								Danh sách push subscription đã đăng ký
							</CardDescription>
						</CardHeader>
						<CardContent>
							{devices.isLoading ? (
								<Skeleton className="h-32 w-full" />
							) : devices.data?.length === 0 ? (
								<Empty>
									<EmptyHeader>
										<EmptyTitle>Chưa có thiết bị nào đăng ký</EmptyTitle>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Người dùng</TableHead>
											<TableHead>Khu vực quan tâm</TableHead>
											<TableHead className="text-right">Ngày đăng ký</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{devices.data?.map((device) => (
											<TableRow key={device.id}>
												<TableCell>
													{device.user.isAnonymous
														? "Ẩn danh"
														: device.user.email}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{device.bridges.length === 0
														? "Tất cả các cầu"
														: device.bridges
																.map((bridge) => bridge.name)
																.join(", ")}
												</TableCell>
												<TableCell className="text-right text-muted-foreground">
													{new Date(device.createdAt).toLocaleString("vi-VN")}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Dialog
				open={editingBridge !== null}
				onOpenChange={(open) => !open && setEditingBridge(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cấu hình ngưỡng — {editingBridge?.name}</DialogTitle>
					</DialogHeader>
					<form
						id="edit-threshold-form"
						onSubmit={handleUpsertThreshold}
						className="grid gap-4"
					>
						<div className="grid gap-2">
							<Label htmlFor="safeMax">Ngưỡng an toàn (m)</Label>
							<Input
								id="safeMax"
								name="safeMax"
								type="number"
								step="0.01"
								defaultValue={editingBridge?.threshold?.safeMax}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="warningMax">Ngưỡng cảnh báo (m)</Label>
							<Input
								id="warningMax"
								name="warningMax"
								type="number"
								step="0.01"
								defaultValue={editingBridge?.threshold?.warningMax}
								required
							/>
						</div>
					</form>
					<DialogFooter>
						<Button
							type="submit"
							form="edit-threshold-form"
							disabled={upsertThreshold.isPending}
						>
							{upsertThreshold.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Lưu"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
