import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { orpc } from "@/utils/orpc";

import { useAdminBridges } from "../hooks/use-admin-bridges";
import type { AdminBridge } from "../types";
import { BridgesCard } from "./bridges-card";
import { EditBridgeDialog } from "./edit-bridge-dialog";
import { EditThresholdDialog } from "./edit-threshold-dialog";

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
		<>
			<BridgesCard
				bridges={bridges.data ?? []}
				isLoading={bridges.isLoading}
				onCreated={() => bridges.refetch()}
				onEditLocation={setEditingBridgeDetails}
				onEditThreshold={setEditingBridge}
				onDelete={(bridge) => deleteBridge.mutate({ id: bridge.id })}
			/>

			<EditBridgeDialog
				bridge={editingBridgeDetails}
				onOpenChange={(open) => !open && setEditingBridgeDetails(null)}
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

			<EditThresholdDialog
				bridge={editingBridge}
				onOpenChange={(open) => !open && setEditingBridge(null)}
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
		</>
	);
}
