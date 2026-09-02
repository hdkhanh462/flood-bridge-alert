import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export function AccountPage() {
	useDocumentTitle("Quản lý tài khoản");
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	const isAnonymous = (session?.user as { isAnonymous?: boolean } | undefined)
		?.isAnonymous;

	useEffect(() => {
		if (!isPending && (!session || isAnonymous)) navigate("/login");
	}, [session, isAnonymous, isPending, navigate]);

	if (isPending || !session || isAnonymous) {
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
