import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
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
import { useQuery } from "@tanstack/react-query";
import { Waves } from "lucide-react";
import { Link } from "react-router";

import { NotificationToggle } from "@/features/notifications/components/notification-toggle";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

import { BridgeMap } from "./bridge-map";
import { StatusBadge } from "./status-badge";

export function BridgesListPage() {
	useDocumentTitle("Trạng thái cầu tràn");
	const bridges = useQuery(orpc.bridge.list.queryOptions());
	const locatedBridges =
		bridges.data?.filter(
			(bridge) => bridge.latitude != null && bridge.longitude != null,
		) ?? [];
	const missingLocationCount =
		(bridges.data?.length ?? 0) - locatedBridges.length;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-semibold text-2xl tracking-tight">
					Trạng thái cầu tràn
				</h1>
				<NotificationToggle />
			</div>

			{bridges.isLoading ? (
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			) : bridges.data?.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Waves />
						</EmptyMedia>
						<EmptyTitle>Chưa có cầu tràn nào</EmptyTitle>
						<EmptyDescription>
							Quản trị viên chưa thêm cầu tràn nào vào hệ thống.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<Tabs defaultValue="grid">
					<TabsList className="mb-4">
						<TabsTrigger value="grid">Lưới</TabsTrigger>
						<TabsTrigger value="map">Bản đồ</TabsTrigger>
					</TabsList>

					<TabsContent value="grid">
						<div className="grid gap-4 sm:grid-cols-2">
							{bridges.data?.map((bridge) => (
								<Card key={bridge.id}>
									<CardHeader className="flex flex-row items-start justify-between gap-2">
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
										<StatusBadge status={bridge.latestReading?.status} />
									</CardHeader>
									<CardContent>
										{bridge.latestReading ? (
											<p className="text-muted-foreground text-sm">
												Mực nước hiện tại:{" "}
												<span className="font-medium text-foreground">
													{bridge.latestReading.level} m
												</span>{" "}
												· Cập nhật lúc{" "}
												{new Date(
													bridge.latestReading.recordedAt,
												).toLocaleString("vi-VN")}
											</p>
										) : (
											<p className="text-muted-foreground text-sm">
												Chưa nhận được dữ liệu mực nước.
											</p>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="map">
						<div className="space-y-2">
							<div className="overflow-hidden rounded-md border">
								<BridgeMap
									markers={locatedBridges.map((bridge) => ({
										id: bridge.id,
										name: bridge.name,
										status: bridge.latestReading?.status,
										latitude: bridge.latitude as number,
										longitude: bridge.longitude as number,
									}))}
									height={420}
								/>
							</div>
							{missingLocationCount > 0 ? (
								<p className="text-muted-foreground text-xs">
									{missingLocationCount} cầu chưa được cấu hình vị trí nên không
									hiển thị trên bản đồ.
								</p>
							) : null}
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
