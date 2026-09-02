import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";

import { EmailForm } from "./email-form";

export function EmailCard({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Cập nhật địa chỉ email đăng nhập</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailForm email={email} />
      </CardContent>
    </Card>
  );
}
