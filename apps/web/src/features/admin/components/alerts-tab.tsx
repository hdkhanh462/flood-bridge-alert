import {
	Card,
	CardContent,
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

import { StatusBadge } from "@/features/bridges/components/status-badge";
import { orpc } from "@/utils/orpc";

export function AlertsTab({ enabled }: { enabled: boolean }) {
	const alerts = useQuery({
		...orpc.admin.alertHistory.list.queryOptions({ input: {} }),
		enabled,
	});

	return (
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
	);
}
