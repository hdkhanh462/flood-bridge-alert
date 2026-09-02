import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@flood-bridge-alert/ui/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { orpc } from "@/utils/orpc";

import { CreateBridgeForm } from "./create-bridge-form";

export function CreateBridgeDialog({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);

	const createBridge = useMutation(
		orpc.admin.bridge.create.mutationOptions({
			onSuccess: () => onCreated(),
		}),
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setFormKey((key) => key + 1);
			}}
		>
			<DialogTrigger render={<Button size="sm" />}>
				<Plus className="h-4 w-4" />
				Thêm cầu
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Thêm cầu mới</DialogTitle>
				</DialogHeader>
				<CreateBridgeForm
					key={formKey}
					isPending={createBridge.isPending}
					onSubmit={(values) => {
						createBridge.mutate(
							{
								name: values.name.trim(),
								location: values.location.trim() || undefined,
								latitude: values.coords?.lat,
								longitude: values.coords?.lng,
							},
							{ onSuccess: () => setOpen(false) },
						);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
