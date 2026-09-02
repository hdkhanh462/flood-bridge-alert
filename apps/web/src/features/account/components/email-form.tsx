import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { emailSchema } from "../schemas";

export function EmailForm({ email }: { email: string }) {
	const form = useForm({
		defaultValues: { email },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.changeEmail({
				newEmail: value.email,
			});
			if (error) {
				toast.error(error.message || error.statusText);
			} else {
				toast.success("Đã cập nhật email");
			}
		},
		validators: {
			onSubmit: emailSchema,
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>Cập nhật địa chỉ email đăng nhập</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="email-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="you@example.com"
									autoComplete="email"
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
			</CardContent>
			<CardFooter>
				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
						isDirty: state.isDirty,
					})}
				>
					{({ canSubmit, isSubmitting, isDirty }) => (
						<Button
							type="submit"
							form="email-form"
							disabled={!canSubmit || isSubmitting || !isDirty}
						>
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</Card>
	);
}
