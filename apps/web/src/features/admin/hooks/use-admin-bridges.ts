import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export function useAdminBridges(enabled: boolean) {
  return useQuery({ ...orpc.admin.bridge.list.queryOptions(), enabled });
}
