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
	Empty,
	EmptyHeader,
	EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@flood-bridge-alert/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

export function UsersTab({ enabled }: { enabled: boolean }) {
	const queryClient = useQueryClient();
	const users = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const result = await authClient.admin.listUsers({
				query: { limit: 50, sortBy: "createdAt", sortDirection: "desc" },
			});
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		enabled,
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

	return (
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
	);
}
