import { Button } from "@flood-bridge-alert/ui/components/button";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Label } from "@flood-bridge-alert/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

import { LocationPicker } from "@/features/bridges/components/location-picker";
import type { Coords } from "@/features/bridges/types";

import { bridgeDetailsSchema } from "../schemas";
import type { AdminBridge } from "../types";

export type BridgeFormValues = {
  name: string;
  location: string;
  coords: Coords | null;
};

export function BridgeForm({
  bridge,
  isPending,
  onSubmit,
}: {
  bridge?: AdminBridge | null;
  isPending: boolean;
  onSubmit: (values: BridgeFormValues) => void;
}) {
  async function handleSubmit({ value }: { value: BridgeFormValues }) {
    onSubmit(value);
  }

  const form = useForm({
    defaultValues: {
      name: bridge?.name ?? "",
      location: bridge?.location ?? "",
      coords: (bridge?.latitude != null && bridge?.longitude != null
        ? { lat: bridge.latitude, lng: bridge.longitude }
        : null) as Coords | null,
    },
    onSubmit: handleSubmit,
    validators: {
      onSubmit: bridgeDetailsSchema,
    },
  });

  return (
    <>
      <form
        id="bridge-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid gap-4"
      >
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Tên cầu</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Cầu Bến Súc"
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
        <form.Field name="location">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Khu vực</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Huyện Củ Chi, TP.HCM"
              />
            </div>
          )}
        </form.Field>
        <form.Field name="coords">
          {(field) => (
            <div className="grid gap-2">
              <Label>Vị trí trên bản đồ</Label>
              <LocationPicker
                value={field.state.value}
                onChange={field.handleChange}
              />
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
              form="bridge-form"
              disabled={
                !canSubmit ||
                isSubmitting ||
                isPending ||
                (bridge != null && !isDirty)
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bridge ? (
                "Lưu"
              ) : (
                "Thêm"
              )}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </>
  );
}
