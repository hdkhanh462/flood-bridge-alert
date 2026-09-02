import SignUpForm from "@/features/auth/components/sign-up-form";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Register() {
	useDocumentTitle("Đăng ký");
	return <SignUpForm />;
}
