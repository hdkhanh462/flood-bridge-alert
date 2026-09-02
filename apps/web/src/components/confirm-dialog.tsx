import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@flood-bridge-alert/ui/components/alert-dialog";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Xác nhận",
	cancelLabel = "Hủy",
	isPending,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	isPending?: boolean;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isPending}
						onClick={onConfirm}
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							confirmLabel
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
