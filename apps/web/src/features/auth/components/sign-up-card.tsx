import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Link } from "react-router";

import { SignUpForm } from "./sign-up-form";

export function SignUpCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tạo tài khoản</CardTitle>
				<CardDescription>
					Đăng ký để nhận cảnh báo và quản lý thông tin cá nhân
				</CardDescription>
			</CardHeader>
			<CardContent>
				<SignUpForm />
			</CardContent>
			<CardFooter>
				<p className="text-muted-foreground text-sm">
					Đã có tài khoản?{" "}
					<Link
						to="/login"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Đăng nhập
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
