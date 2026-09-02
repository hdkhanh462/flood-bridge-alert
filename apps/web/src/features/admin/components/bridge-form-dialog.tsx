import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@flood-bridge-alert/ui/components/dialog";
import type { ReactNode } from "react";

import type { AdminBridge } from "../types";
import { BridgeForm, type BridgeFormValues } from "./bridge-form";

export function BridgeFormDialog({
  bridge,
  open,
  onOpenChange,
  isPending,
  onSubmit,
  trigger,
}: {
  bridge?: AdminBridge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: BridgeFormValues) => void;
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger render={<Button size="sm" />}>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {bridge ? `Sửa cầu — ${bridge.name}` : "Thêm cầu mới"}
          </DialogTitle>
        </DialogHeader>
        <BridgeForm
          key={bridge?.id ?? "create"}
          bridge={bridge}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
