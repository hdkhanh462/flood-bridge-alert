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
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export function DevicesTab({ enabled }: { enabled: boolean }) {
	const devices = useQuery({
		...orpc.admin.pushSubscription.list.queryOptions(),
		enabled,
	});

	return (
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
										{device.user.isAnonymous ? "Ẩn danh" : device.user.email}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{device.bridges.length === 0
											? "Tất cả các cầu"
											: device.bridges.map((bridge) => bridge.name).join(", ")}
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
	);
}
