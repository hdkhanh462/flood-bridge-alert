import { useEffect } from "react";
import { useNavigate } from "react-router";

import Loader from "@/components/loader";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

import { SignInCard } from "./sign-in-card";

export function LoginView() {
	useDocumentTitle("Đăng nhập");
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

	if (isPending) {
		return <Loader />;
	}

	return <SignInCard />;
}
