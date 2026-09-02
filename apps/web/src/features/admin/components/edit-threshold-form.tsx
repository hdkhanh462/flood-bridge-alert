import { Button } from "@flood-bridge-alert/ui/components/button";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

import { thresholdSchema } from "../schemas";
import type { AdminBridge } from "../types";

type ThresholdFormValues = { safeMax: number; warningMax: number };

export function EditThresholdForm({
  bridge,
  isPending,
  onSubmit,
}: {
  bridge: AdminBridge | null;
  isPending: boolean;
  onSubmit: (values: ThresholdFormValues) => void;
}) {
  async function handleSubmit({ value }: { value: ThresholdFormValues }) {
    onSubmit(value);
  }

  const form = useForm({
    defaultValues: {
      safeMax: bridge?.threshold?.safeMax ?? 0,
      warningMax: bridge?.threshold?.warningMax ?? 0,
    },
    onSubmit: handleSubmit,
    validators: {
      onSubmit: thresholdSchema,
    },
  });

  return (
    <>
      <form
        id="edit-threshold-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid gap-4"
      >
        <form.Field name="safeMax">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Ngưỡng an toàn (m)</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="0.01"
                placeholder="Ví dụ: 1.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                required
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-destructive text-sm">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
        <form.Field name="warningMax">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Ngưỡng cảnh báo (m)</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="0.01"
                placeholder="Ví dụ: 2.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                required
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
              form="edit-threshold-form"
              disabled={!canSubmit || isSubmitting || !isDirty || isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </>
  );
}
