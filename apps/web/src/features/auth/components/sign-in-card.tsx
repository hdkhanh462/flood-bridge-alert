import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Link } from "react-router";

import { SignInForm } from "./sign-in-form";

export function SignInCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Đăng nhập để truy cập khu vực quản trị
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter>
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
