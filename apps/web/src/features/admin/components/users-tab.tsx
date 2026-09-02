import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

import { UsersCard } from "./users-card";

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
		<UsersCard
			users={users.data?.users ?? []}
			isLoading={users.isLoading}
			isMutating={toggleRole.isPending || banUser.isPending || unbanUser.isPending}
			onToggleRole={(user) =>
				toggleRole.mutate({
					userId: user.id,
					role: user.role === "admin" ? "user" : "admin",
				})
			}
			onToggleBan={(user) =>
				user.banned ? unbanUser.mutate(user.id) : banUser.mutate(user.id)
			}
		/>
	);
}
