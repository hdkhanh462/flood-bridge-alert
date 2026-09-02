import { Button } from "@flood-bridge-alert/ui/components/button";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

import { LocationPicker } from "@/features/bridges/components/location-picker";
import type { Coords } from "@/features/bridges/types";

import { bridgeDetailsSchema } from "../schemas";

export function CreateBridgeForm({
	isPending,
	onSubmit,
}: {
	isPending: boolean;
	onSubmit: (values: {
		name: string;
		location: string;
		coords: Coords | null;
	}) => void;
}) {
	const form = useForm({
		defaultValues: {
			name: "",
			location: "",
			coords: null as Coords | null,
		},
		onSubmit: async ({ value }) => onSubmit(value),
		validators: {
			onSubmit: bridgeDetailsSchema,
		},
	});

	return (
		<>
			<form
				id="create-bridge-form"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="grid gap-4"
			>
				<form.Field name="name">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor={field.name}>Tên cầu</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Cầu Bến Súc"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-destructive text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
				<form.Field name="location">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor={field.name}>Khu vực</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Huyện Củ Chi, TP.HCM"
							/>
						</div>
					)}
				</form.Field>
				<form.Field name="coords">
					{(field) => (
						<div className="grid gap-2">
							<Label>Vị trí trên bản đồ</Label>
							<LocationPicker
								value={field.state.value}
								onChange={field.handleChange}
							/>
						</div>
					)}
				</form.Field>
			</form>
			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<div className="mt-4 flex justify-end">
						<Button
							type="submit"
							form="create-bridge-form"
							disabled={!canSubmit || isSubmitting || isPending}
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Thêm"
							)}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</>
	);
}
