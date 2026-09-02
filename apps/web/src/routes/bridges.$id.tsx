import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@flood-bridge-alert/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { Link, useParams } from "react-router";

import { BridgeLocationDialog } from "@/components/bridge-location-dialog";
import { StatusBadge } from "@/components/status-badge";
import { WaterLevelChart } from "@/components/water-level-chart";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

export default function BridgeDetail() {
	useDocumentTitle("Chi tiết cầu tràn");
	const { id } = useParams<{ id: string }>();
	const bridgeId = id ?? "";
	const bridge = useQuery(
		orpc.bridge.getById.queryOptions({ input: { id: bridgeId } }),
	);
	const history = useQuery(
		orpc.bridge.history.queryOptions({ input: { id: bridgeId, limit: 100 } }),
	);
	const alerts = useQuery(
		orpc.bridge.alerts.queryOptions({ input: { id: bridgeId } }),
	);

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
			<Button
				variant="link"
				size="sm"
				className="mb-2 px-0"
				nativeButton={false}
				render={<Link to="/bridges" />}
			>
				<ArrowLeft className="h-4 w-4" />
				Quay lại danh sách cầu
			</Button>

			{bridge.isLoading ? (
				<Skeleton className="mt-2 h-8 w-64" />
			) : bridge.data ? (
				<div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-2">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							{bridge.data.name}
						</h1>
						{bridge.data.location ? (
							<p className="text-muted-foreground text-sm">
								{bridge.data.location}
							</p>
						) : null}
					</div>
					<div className="flex items-center gap-2">
						<StatusBadge status={bridge.data.latestReading?.status} />
						<BridgeLocationDialog
							bridge={{
								id: bridge.data.id,
								name: bridge.data.name,
								status: bridge.data.latestReading?.status,
								latitude: bridge.data.latitude,
								longitude: bridge.data.longitude,
							}}
						>
							<MapPin className="h-4 w-4" />
							Xem vị trí trên bản đồ
						</BridgeLocationDialog>
					</div>
				</div>
			) : (
				<p className="mt-4 text-muted-foreground">Không tìm thấy cầu này.</p>
			)}

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Mực nước theo thời gian</CardTitle>
					<CardDescription>
						Biểu đồ mực nước gần đây và các ngưỡng cảnh báo
					</CardDescription>
				</CardHeader>
				<CardContent>
					{history.isLoading ? (
						<Skeleton className="h-[240px] w-full" />
					) : (
						<WaterLevelChart
							readings={history.data?.readings ?? []}
							threshold={history.data?.threshold ?? null}
						/>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Lịch sử cảnh báo</CardTitle>
				</CardHeader>
				<CardContent>
					{alerts.isLoading ? (
						<p className="text-muted-foreground text-sm">Đang tải...</p>
					) : alerts.data?.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							Chưa có cảnh báo nào cho cầu này.
						</p>
					) : (
						<Table>
							<TableBody>
								{alerts.data?.map((alert) => (
									<TableRow key={alert.id}>
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
		</div>
	);
}
