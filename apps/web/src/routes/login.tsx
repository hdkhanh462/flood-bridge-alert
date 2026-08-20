import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Login() {
	useDocumentTitle("Đăng nhập");
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<div className="container mx-auto max-w-md px-4 py-6">
			{showSignIn ? (
				<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
			) : (
				<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
			)}
		</div>
	);
}
