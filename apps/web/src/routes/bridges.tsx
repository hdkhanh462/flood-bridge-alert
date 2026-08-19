import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { NotificationToggle } from "@/components/notification-toggle";
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

export default function Bridges() {
	useDocumentTitle("Trạng thái cầu tràn");
	const bridges = useQuery(orpc.bridge.list.queryOptions());

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-semibold text-2xl">Trạng thái cầu tràn</h1>
				<NotificationToggle />
			</div>

			{bridges.isLoading ? (
				<div className="grid gap-4">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : bridges.data?.length === 0 ? (
				<p className="text-muted-foreground">Chưa có dữ liệu cầu tràn nào.</p>
			) : (
				<div className="grid gap-4">
					{bridges.data?.map((bridge) => {
						const status = bridge.latestReading?.status ?? null;
						return (
							<Card key={bridge.id}>
								<CardHeader className="flex flex-row items-center justify-between">
									<div>
										<CardTitle>
											<Link
												to={`/bridges/${bridge.id}`}
												className="hover:underline"
											>
												{bridge.name}
											</Link>
										</CardTitle>
										{bridge.location ? (
											<CardDescription>{bridge.location}</CardDescription>
										) : null}
									</div>
									<span
										className={`rounded-full px-3 py-1 font-medium text-sm ${
											status
												? STATUS_CLASS[status]
												: "bg-muted text-muted-foreground"
										}`}
									>
										{status ? STATUS_LABEL[status] : "Chưa có dữ liệu"}
									</span>
								</CardHeader>
								<CardContent>
									{bridge.latestReading ? (
										<p className="text-muted-foreground text-sm">
											Mực nước hiện tại:{" "}
											<span className="font-medium text-foreground">
												{bridge.latestReading.level} m
											</span>{" "}
											· Cập nhật lúc{" "}
											{new Date(bridge.latestReading.recordedAt).toLocaleString(
												"vi-VN",
											)}
										</p>
									) : (
										<p className="text-muted-foreground text-sm">
											Chưa nhận được dữ liệu mực nước.
										</p>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
