import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { AlertsCard } from "./alerts-card";

export function AlertsTab({ enabled }: { enabled: boolean }) {
  const alerts = useQuery({
    ...orpc.admin.alertHistory.list.queryOptions({ input: {} }),
    enabled,
  });

  return <AlertsCard alerts={alerts.data ?? []} isLoading={alerts.isLoading} />;
}
