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
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

function ProfileForm({ name }: { name: string }) {
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
			onSubmit: z.object({
				name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
			}),
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Hồ sơ</CardTitle>
				<CardDescription>Cập nhật tên hiển thị của bạn</CardDescription>
			</CardHeader>
			<CardContent>
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
			</CardContent>
			<CardFooter>
				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							form="profile-form"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</Card>
	);
}

function EmailForm({ email }: { email: string }) {
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
			onSubmit: z.object({
				email: z.email("Email không hợp lệ"),
			}),
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
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							form="email-form"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</Card>
	);
}

function PasswordForm() {
	const form = useForm({
		defaultValues: { currentPassword: "", newPassword: "" },
		onSubmit: async ({ value, formApi }) => {
			const { error } = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: true,
			});
			if (error) {
				toast.error(error.message || error.statusText);
			} else {
				toast.success("Đã đổi mật khẩu");
				formApi.reset();
			}
		},
		validators: {
			onSubmit: z.object({
				currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
				newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
			}),
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Mật khẩu</CardTitle>
				<CardDescription>Đổi mật khẩu đăng nhập của bạn</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="password-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="currentPassword">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Mật khẩu hiện tại</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="current-password"
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

					<form.Field name="newPassword">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Mật khẩu mới</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="new-password"
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
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							form="password-form"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</Card>
	);
}

export default function Account() {
	useDocumentTitle("Quản lý tài khoản");
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!session && !isPending) navigate("/login");
	}, [session, isPending, navigate]);

	if (isPending || !session) {
		return (
			<div className="container mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-10">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-10">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Quản lý tài khoản
				</h1>
				<p className="text-muted-foreground text-sm">
					Cập nhật thông tin đăng nhập của tài khoản {session.user.email}
				</p>
			</div>
			<ProfileForm name={session.user.name} />
			<EmailForm email={session.user.email} />
			<PasswordForm />
		</div>
	);
}
