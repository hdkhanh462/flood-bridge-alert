import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@flood-bridge-alert/ui/components/tabs";
import { ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

import { AlertsTab } from "./alerts-tab";
import { BridgesTab } from "./bridges-tab";
import { DevicesTab } from "./devices-tab";
import { UsersTab } from "./users-tab";

export function AdminView() {
	useDocumentTitle("Quản trị cầu tràn");
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const isAdmin = session?.user.role === "admin";

	useEffect(() => {
		if (!session && !isPending) navigate("/login");
	}, [session, isPending, navigate]);

	if (isPending) {
		return <Skeleton className="h-8 w-64" />;
	}

	if (!session) {
		return null;
	}

	if (!isAdmin) {
		return (
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
		);
	}

	return (
		<>
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
					<BridgesTab enabled={isAdmin} />
				</TabsContent>
				<TabsContent value="alerts">
					<AlertsTab enabled={isAdmin} />
				</TabsContent>
				<TabsContent value="users">
					<UsersTab enabled={isAdmin} />
				</TabsContent>
				<TabsContent value="devices">
					<DevicesTab enabled={isAdmin} />
				</TabsContent>
			</Tabs>
		</>
	);
}
