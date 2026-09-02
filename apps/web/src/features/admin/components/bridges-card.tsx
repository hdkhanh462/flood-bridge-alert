import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Empty,
	EmptyDescription,
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
import { MapPin, Pencil, Trash2 } from "lucide-react";

import { SensorStatusBadge } from "@/features/bridges/components/status-badge";

import type { AdminBridge } from "../types";
import { CreateBridgeDialog } from "./create-bridge-dialog";

export function BridgesCard({
	bridges,
	isLoading,
	onCreated,
	onEditLocation,
	onEditThreshold,
	onDelete,
}: {
	bridges: AdminBridge[];
	isLoading: boolean;
	onCreated: () => void;
	onEditLocation: (bridge: AdminBridge) => void;
	onEditThreshold: (bridge: AdminBridge) => void;
	onDelete: (bridge: AdminBridge) => void;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Danh sách cầu</CardTitle>
					<CardDescription>Quản lý cầu tràn và ngưỡng cảnh báo</CardDescription>
				</div>
				<CreateBridgeDialog onCreated={onCreated} />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-32 w-full" />
				) : bridges.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Chưa có cầu nào</EmptyTitle>
							<EmptyDescription>Bấm "Thêm cầu" để bắt đầu.</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tên cầu</TableHead>
								<TableHead>Cảm biến</TableHead>
								<TableHead>Ngưỡng</TableHead>
								<TableHead className="text-right">Hành động</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bridges.map((bridge) => (
								<TableRow key={bridge.id}>
									<TableCell>
										<div className="font-medium">{bridge.name}</div>
										{bridge.location ? (
											<div className="text-muted-foreground text-xs">
												{bridge.location}
											</div>
										) : null}
									</TableCell>
									<TableCell>
										<SensorStatusBadge status={bridge.sensorStatus} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{bridge.threshold ? (
											<>
												An toàn ≤ {bridge.threshold.safeMax}m · Cảnh báo ≤{" "}
												{bridge.threshold.warningMax}m
											</>
										) : (
											"Chưa cấu hình"
										)}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Sửa vị trí"
											onClick={() => onEditLocation(bridge)}
										>
											<MapPin className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Sửa ngưỡng"
											onClick={() => onEditThreshold(bridge)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Xóa cầu"
											onClick={() => onDelete(bridge)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
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
