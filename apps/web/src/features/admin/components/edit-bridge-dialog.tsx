import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@flood-bridge-alert/ui/components/dialog";

import type { Coords } from "@/features/bridges/types";

import type { AdminBridge } from "../types";
import { EditBridgeForm } from "./edit-bridge-form";

export function EditBridgeDialog({
	bridge,
	onOpenChange,
	isPending,
	onSubmit,
}: {
	bridge: AdminBridge | null;
	onOpenChange: (open: boolean) => void;
	isPending: boolean;
	onSubmit: (values: {
		name: string;
		location: string;
		coords: Coords | null;
	}) => void;
}) {
	return (
		<Dialog open={bridge !== null} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Sửa cầu — {bridge?.name}</DialogTitle>
				</DialogHeader>
				<EditBridgeForm
					key={bridge?.id ?? "none"}
					bridge={bridge}
					isPending={isPending}
					onSubmit={onSubmit}
				/>
			</DialogContent>
		</Dialog>
	);
}
