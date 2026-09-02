import { Button } from "@flood-bridge-alert/ui/components/button";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { passwordSchema } from "../schemas";

type PasswordValues = { currentPassword: string; newPassword: string };

export function PasswordForm() {
  async function handleSubmit({
    value,
    formApi,
  }: {
    value: PasswordValues;
    formApi: { reset: () => void };
  }) {
    const { error } = await authClient.changePassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      toast.error(error.message || error.statusText);
    } else {
      toast.success("Đã đổi mật khẩu");
      formApi.reset();
    }
  }

  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
    onSubmit: handleSubmit,
    validators: {
      onSubmit: passwordSchema,
    },
  });

  return (
    <>
      <form
        id="password-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="currentPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Mật khẩu hiện tại</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-destructive text-sm">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="newPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Mật khẩu mới</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-destructive text-sm">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </form>
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          isDirty: state.isDirty,
        })}
      >
        {({ canSubmit, isSubmitting, isDirty }) => (
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              form="password-form"
              disabled={!canSubmit || isSubmitting || !isDirty}
            >
              {isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </>
  );
}
