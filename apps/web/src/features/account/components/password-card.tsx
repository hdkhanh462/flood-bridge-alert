import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";

import { PasswordForm } from "./password-form";

export function PasswordCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mật khẩu</CardTitle>
        <CardDescription>Đổi mật khẩu đăng nhập của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordForm />
      </CardContent>
    </Card>
  );
}
