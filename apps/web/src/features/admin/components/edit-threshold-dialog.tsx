import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@flood-bridge-alert/ui/components/dialog";

import type { AdminBridge } from "../types";
import { EditThresholdForm } from "./edit-threshold-form";

export function EditThresholdDialog({
	bridge,
	onOpenChange,
	isPending,
	onSubmit,
}: {
	bridge: AdminBridge | null;
	onOpenChange: (open: boolean) => void;
	isPending: boolean;
	onSubmit: (values: { safeMax: number; warningMax: number }) => void;
}) {
	return (
		<Dialog open={bridge !== null} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cấu hình ngưỡng — {bridge?.name}</DialogTitle>
				</DialogHeader>
				<EditThresholdForm
					key={bridge?.id ?? "none"}
					bridge={bridge}
					isPending={isPending}
					onSubmit={onSubmit}
				/>
			</DialogContent>
		</Dialog>
	);
}
