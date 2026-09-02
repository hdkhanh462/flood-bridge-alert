import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { orpc } from "@/utils/orpc";

import { useAdminBridges } from "../hooks/use-admin-bridges";
import type { AdminBridge } from "../types";
import type { BridgeFormValues } from "./bridge-form";
import { BridgeFormDialog } from "./bridge-form-dialog";
import { BridgesCard } from "./bridges-card";
import { EditThresholdDialog } from "./edit-threshold-dialog";

export function BridgesTab({ enabled }: { enabled: boolean }) {
	const queryClient = useQueryClient();
	const bridges = useAdminBridges(enabled);

	const [createOpen, setCreateOpen] = useState(false);
	const [editingBridge, setEditingBridge] = useState<AdminBridge | null>(null);
	const [editingThreshold, setEditingThreshold] = useState<AdminBridge | null>(
		null,
	);
	const [deletingBridge, setDeletingBridge] = useState<AdminBridge | null>(
		null,
	);

	const createBridge = useMutation(
		orpc.admin.bridge.create.mutationOptions({
			onSuccess: () => bridges.refetch(),
		}),
	);
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
				setDeletingBridge(null);
			},
		}),
	);

	function handleCreateBridge(values: BridgeFormValues) {
		createBridge.mutate(
			{
				name: values.name.trim(),
				location: values.location.trim() || undefined,
				latitude: values.coords?.lat,
				longitude: values.coords?.lng,
			},
			{ onSuccess: () => setCreateOpen(false) },
		);
	}

	function handleUpdateBridge(values: BridgeFormValues) {
		if (!editingBridge) return;
		updateBridge.mutate(
			{
				id: editingBridge.id,
				name: values.name.trim(),
				location: values.location.trim() || undefined,
				latitude: values.coords?.lat,
				longitude: values.coords?.lng,
			},
			{ onSuccess: () => setEditingBridge(null) },
		);
	}

	function handleUpdateThreshold(values: {
		safeMax: number;
		warningMax: number;
	}) {
		if (!editingThreshold) return;
		upsertThreshold.mutate(
			{
				bridgeId: editingThreshold.id,
				safeMax: values.safeMax,
				warningMax: values.warningMax,
			},
			{ onSuccess: () => setEditingThreshold(null) },
		);
	}

	function handleConfirmDelete() {
		if (!deletingBridge) return;
		deleteBridge.mutate({ id: deletingBridge.id });
	}

	return (
		<>
			<BridgesCard
				bridges={bridges.data ?? []}
				isLoading={bridges.isLoading}
				createOpen={createOpen}
				onCreateOpenChange={setCreateOpen}
				isCreating={createBridge.isPending}
				onCreateSubmit={handleCreateBridge}
				onEditLocation={setEditingBridge}
				onEditThreshold={setEditingThreshold}
				onRequestDelete={setDeletingBridge}
			/>

			<BridgeFormDialog
				bridge={editingBridge}
				open={editingBridge !== null}
				onOpenChange={(open) => !open && setEditingBridge(null)}
				isPending={updateBridge.isPending}
				onSubmit={handleUpdateBridge}
			/>

			<EditThresholdDialog
				bridge={editingThreshold}
				onOpenChange={(open) => !open && setEditingThreshold(null)}
				isPending={upsertThreshold.isPending}
				onSubmit={handleUpdateThreshold}
			/>

			<ConfirmDialog
				open={deletingBridge !== null}
				onOpenChange={(open) => !open && setDeletingBridge(null)}
				title={`Xóa cầu "${deletingBridge?.name}"?`}
				description="Toàn bộ dữ liệu mực nước, ngưỡng cảnh báo và lịch sử cảnh báo của cầu này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
				confirmLabel="Xóa cầu"
				isPending={deleteBridge.isPending}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
