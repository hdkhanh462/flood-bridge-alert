import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@flood-bridge-alert/ui/components/dialog";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

import { LocationPicker } from "@/features/bridges/components/location-picker";
import type { Coords } from "@/features/bridges/types";
import { orpc } from "@/utils/orpc";

export function CreateBridgeDialog({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false);
	const [location, setLocation] = useState<Coords | null>(null);

	const createBridge = useMutation(
		orpc.admin.bridge.create.mutationOptions({
			onSuccess: () => onCreated(),
		}),
	);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const bridgeLocation = String(formData.get("location") ?? "").trim();
		if (!name) return;
		createBridge.mutate(
			{
				name,
				location: bridgeLocation || undefined,
				latitude: location?.lat,
				longitude: location?.lng,
			},
			{
				onSuccess: () => {
					setOpen(false);
					setLocation(null);
				},
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) setLocation(null);
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
				<form
					id="create-bridge-form"
					onSubmit={handleSubmit}
					className="grid gap-4"
				>
					<div className="grid gap-2">
						<Label htmlFor="name">Tên cầu</Label>
						<Input id="name" name="name" placeholder="Cầu Bến Súc" required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="location">Khu vực</Label>
						<Input
							id="location"
							name="location"
							placeholder="Huyện Củ Chi, TP.HCM"
						/>
					</div>
					<div className="grid gap-2">
						<Label>Vị trí trên bản đồ</Label>
						<LocationPicker value={location} onChange={setLocation} />
					</div>
				</form>
				<DialogFooter>
					<Button
						type="submit"
						form="create-bridge-form"
						disabled={createBridge.isPending}
					>
						{createBridge.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							"Thêm"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
