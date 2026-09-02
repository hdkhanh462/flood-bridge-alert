import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";

import { ProfileForm } from "./profile-form";

export function ProfileCard({ name }: { name: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hồ sơ</CardTitle>
        <CardDescription>Cập nhật tên hiển thị của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm name={name} />
      </CardContent>
    </Card>
  );
}
