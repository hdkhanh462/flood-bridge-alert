import Loader from "@/components/loader";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";

import { SignUpCard } from "./sign-up-card";

export function RegisterView() {
	useDocumentTitle("Đăng ký");
	const { isPending } = authClient.useSession();

	if (isPending) {
		return <Loader />;
	}

	return <SignUpCard />;
}
