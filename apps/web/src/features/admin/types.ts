import type { useAdminBridges } from "./hooks/use-admin-bridges";

export type AdminBridge = NonNullable<
  ReturnType<typeof useAdminBridges>["data"]
>[number];
