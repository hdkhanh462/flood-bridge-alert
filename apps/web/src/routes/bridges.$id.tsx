import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { WaterLevelChart } from "@/components/water-level-chart";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

const STATUS_LABEL: Record<string, string> = {
	SAFE: "An toàn",
	WARNING: "Cảnh báo",
	DANGER: "Nguy hiểm",
};

const STATUS_CLASS: Record<string, string> = {
	SAFE: "bg-green-500/15 text-green-600 dark:text-green-400",
	WARNING: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
	DANGER: "bg-red-500/15 text-red-600 dark:text-red-400",
};

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
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<Link
				to="/bridges"
				className="text-muted-foreground text-sm hover:underline"
			>
				← Quay lại danh sách cầu
			</Link>

			{bridge.isLoading ? (
				<Skeleton className="mt-4 h-8 w-64" />
			) : bridge.data ? (
				<div className="mt-2 mb-4 flex items-center justify-between">
					<div>
						<h1 className="font-semibold text-2xl">{bridge.data.name}</h1>
						{bridge.data.location ? (
							<p className="text-muted-foreground text-sm">
								{bridge.data.location}
							</p>
						) : null}
					</div>
					{bridge.data.latestReading ? (
						<span
							className={`rounded-full px-3 py-1 font-medium text-sm ${STATUS_CLASS[bridge.data.latestReading.status]}`}
						>
							{STATUS_LABEL[bridge.data.latestReading.status]}
						</span>
					) : null}
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
						<p className="text-muted-foreground">Đang tải...</p>
					) : alerts.data?.length === 0 ? (
						<p className="text-muted-foreground">
							Chưa có cảnh báo nào cho cầu này.
						</p>
					) : (
						<ul className="space-y-2">
							{alerts.data?.map((alert) => (
								<li
									key={alert.id}
									className="flex items-center justify-between border-b pb-2 text-sm last:border-0"
								>
									<span
										className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[alert.status]}`}
									>
										{STATUS_LABEL[alert.status]}
									</span>
									<span className="text-muted-foreground">
										{new Date(alert.createdAt).toLocaleString("vi-VN")}
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
