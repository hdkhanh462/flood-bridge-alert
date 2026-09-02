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
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	const isAnonymous = (session?.user as { isAnonymous?: boolean } | undefined)
		?.isAnonymous;

	useEffect(() => {
		if (!isPending && session && !isAnonymous) {
			navigate(session.user.role === "admin" ? "/admin" : "/", {
				replace: true,
			});
		}
	}, [session, isAnonymous, isPending, navigate]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: (ctx) => {
						navigate(ctx.data.user.role === "admin" ? "/admin" : "/");
						toast.success("Đăng nhập thành công");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Email không hợp lệ"),
				password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<Card className="mx-auto mt-10 w-full max-w-md">
			<CardHeader>
				<CardTitle>Đăng nhập</CardTitle>
				<CardDescription>
					Đăng nhập để truy cập khu vực quản trị
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="sign-in-form"
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

					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Mật khẩu</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Nhập mật khẩu"
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
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-4">
				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							form="sign-in-form"
							className="w-full"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
						</Button>
					)}
				</form.Subscribe>
				<p className="text-muted-foreground text-sm">
					Chưa có tài khoản?{" "}
					<Link
						to="/register"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Đăng ký
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
