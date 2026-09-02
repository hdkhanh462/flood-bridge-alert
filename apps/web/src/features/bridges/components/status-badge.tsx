import { Badge } from "@flood-bridge-alert/ui/components/badge";

import { SENSOR_STATUS_BADGE_META, STATUS_BADGE_META } from "../constants";
import type { BridgeStatus } from "../types";

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const meta =
    status && status in STATUS_BADGE_META
      ? STATUS_BADGE_META[status as BridgeStatus]
      : null;
  if (!meta) {
    return <Badge variant="outline">Chưa có dữ liệu</Badge>;
  }
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function SensorStatusBadge({ status }: { status: string }) {
  const meta =
    status in SENSOR_STATUS_BADGE_META
      ? SENSOR_STATUS_BADGE_META[
          status as keyof typeof SENSOR_STATUS_BADGE_META
        ]
      : null;
  if (!meta) {
    return <Badge variant="outline">{status}</Badge>;
  }
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
