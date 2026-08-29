import SignInForm from "@/components/sign-in-form";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Login() {
	useDocumentTitle("Đăng nhập");
	return <SignInForm />;
}
