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
			<Link to="/login">
				<Button variant="outline">Đăng nhập</Button>
			</Link>
		);
	}

	const initial = session.user.name?.trim().charAt(0).toUpperCase() || "?";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="gap-2 px-2" />}
			>
				<Avatar size="sm">
					<AvatarFallback>{initial}</AvatarFallback>
				</Avatar>
				<span className="hidden sm:inline">{session.user.name}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
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
