import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { DevicesCard } from "./devices-card";

export function DevicesTab({ enabled }: { enabled: boolean }) {
  const devices = useQuery({
    ...orpc.admin.pushSubscription.list.queryOptions(),
    enabled,
  });

  return (
    <DevicesCard devices={devices.data ?? []} isLoading={devices.isLoading} />
  );
}
