import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@flood-bridge-alert/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { BridgeMap } from "./bridge-map";

export function BridgeLocationDialog({
  bridge,
  children,
}: {
  bridge: {
    id: string;
    name: string;
    status?: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  children: ReactNode;
}) {
  const hasLocation = bridge.latitude != null && bridge.longitude != null;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vị trí: {bridge.name}</DialogTitle>
        </DialogHeader>
        {hasLocation ? (
          <BridgeMap
            markers={[
              {
                id: bridge.id,
                name: bridge.name,
                status: bridge.status,
                latitude: bridge.latitude as number,
                longitude: bridge.longitude as number,
              },
            ]}
            height={320}
          />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPin />
              </EmptyMedia>
              <EmptyTitle>Chưa cấu hình vị trí</EmptyTitle>
              <EmptyDescription>
                Quản trị viên chưa đặt vị trí cho cầu này.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </DialogContent>
    </Dialog>
  );
}
