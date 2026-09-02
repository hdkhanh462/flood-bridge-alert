import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@flood-bridge-alert/ui/components/dialog";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { SensorStatusBadge } from "@/features/bridges/components/status-badge";
import { orpc } from "@/utils/orpc";

import { useAdminBridges } from "../hooks/use-admin-bridges";
import type { AdminBridge } from "../types";
import { CreateBridgeDialog } from "./create-bridge-dialog";
import { EditBridgeForm } from "./edit-bridge-form";
import { EditThresholdForm } from "./edit-threshold-form";

export function BridgesTab({ enabled }: { enabled: boolean }) {
	const queryClient = useQueryClient();
	const bridges = useAdminBridges(enabled);

	const [editingBridge, setEditingBridge] = useState<AdminBridge | null>(null);
	const [editingBridgeDetails, setEditingBridgeDetails] =
		useState<AdminBridge | null>(null);

	const updateBridge = useMutation(
		orpc.admin.bridge.update.mutationOptions({
			onSuccess: () => bridges.refetch(),
		}),
	);
	const upsertThreshold = useMutation(
		orpc.admin.threshold.upsert.mutationOptions({
			onSuccess: () => bridges.refetch(),
		}),
	);
	const deleteBridge = useMutation(
		orpc.admin.bridge.delete.mutationOptions({
			onSuccess: () => {
				bridges.refetch();
				queryClient.invalidateQueries({
					queryKey: orpc.admin.alertHistory.list.key(),
				});
			},
		}),
	);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Danh sách cầu</CardTitle>
					<CardDescription>Quản lý cầu tràn và ngưỡng cảnh báo</CardDescription>
				</div>
				<CreateBridgeDialog onCreated={() => bridges.refetch()} />
			</CardHeader>
			<CardContent>
				{bridges.isLoading ? (
					<Skeleton className="h-32 w-full" />
				) : bridges.data?.length === 0 ? (
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
							{bridges.data?.map((bridge) => (
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
											onClick={() => setEditingBridgeDetails(bridge)}
										>
											<MapPin className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Sửa ngưỡng"
											onClick={() => setEditingBridge(bridge)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Xóa cầu"
											onClick={() => deleteBridge.mutate({ id: bridge.id })}
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

			<Dialog
				open={editingBridgeDetails !== null}
				onOpenChange={(open) => !open && setEditingBridgeDetails(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sửa cầu — {editingBridgeDetails?.name}</DialogTitle>
					</DialogHeader>
					<EditBridgeForm
						key={editingBridgeDetails?.id ?? "none"}
						bridge={editingBridgeDetails}
						isPending={updateBridge.isPending}
						onSubmit={(values) => {
							if (!editingBridgeDetails) return;
							updateBridge.mutate(
								{
									id: editingBridgeDetails.id,
									name: values.name,
									location: values.location.trim() || undefined,
									latitude: values.coords?.lat,
									longitude: values.coords?.lng,
								},
								{ onSuccess: () => setEditingBridgeDetails(null) },
							);
						}}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editingBridge !== null}
				onOpenChange={(open) => !open && setEditingBridge(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cấu hình ngưỡng — {editingBridge?.name}</DialogTitle>
					</DialogHeader>
					<EditThresholdForm
						key={editingBridge?.id ?? "none"}
						bridge={editingBridge}
						isPending={upsertThreshold.isPending}
						onSubmit={(values) => {
							if (!editingBridge) return;
							upsertThreshold.mutate(
								{
									bridgeId: editingBridge.id,
									safeMax: values.safeMax,
									warningMax: values.warningMax,
								},
								{ onSuccess: () => setEditingBridge(null) },
							);
						}}
					/>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
