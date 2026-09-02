import {
	Avatar,
	AvatarFallback,
} from "@flood-bridge-alert/ui/components/avatar";
import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@flood-bridge-alert/ui/components/dropdown-menu";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-9 rounded-full" />;
	}

	if (!session) {
		return (
			<Button
				variant="outline"
				nativeButton={false}
				render={<Link to="/login" />}
			>
				Đăng nhập
			</Button>
		);
	}

	const isAnonymous = (session.user as { isAnonymous?: boolean }).isAnonymous;
	const displayName = isAnonymous ? "Khách" : session.user.name;
	const initial = displayName.trim().charAt(0).toUpperCase() || "?";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="gap-2 px-2" />}
			>
				<Avatar size="sm">
					<AvatarFallback>{initial}</AvatarFallback>
				</Avatar>
				<span className="hidden sm:inline">{displayName}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-72 bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-semibold text-foreground text-sm">
						{displayName}
					</DropdownMenuLabel>
					{isAnonymous ? null : (
						<DropdownMenuLabel className="-mt-1.5 whitespace-normal break-all pt-0 font-normal">
							{session.user.email}
						</DropdownMenuLabel>
					)}
					<DropdownMenuSeparator />
					{isAnonymous ? null : (
						<DropdownMenuItem
							nativeButton={false}
							render={<Link to="/account" />}
						>
							<UserCog className="h-4 w-4" />
							Quản lý tài khoản
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate("/");
									},
								},
							});
						}}
					>
						Đăng xuất
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
