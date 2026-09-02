import { Button } from "@flood-bridge-alert/ui/components/button";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { profileSchema } from "../schemas";

export function ProfileForm({ name }: { name: string }) {
	const form = useForm({
		defaultValues: { name },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.updateUser({ name: value.name });
			if (error) {
				toast.error(error.message || error.statusText);
			} else {
				toast.success("Đã cập nhật tên hiển thị");
			}
		},
		validators: {
			onSubmit: profileSchema,
		},
	});

	return (
		<>
			<form
				id="profile-form"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Tên hiển thị</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Nguyễn Văn A"
								autoComplete="name"
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
			</form>
			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
					isDirty: state.isDirty,
				})}
			>
				{({ canSubmit, isSubmitting, isDirty }) => (
					<div className="mt-4 flex justify-end">
						<Button
							type="submit"
							form="profile-form"
							disabled={!canSubmit || isSubmitting || !isDirty}
						>
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</>
	);
}
