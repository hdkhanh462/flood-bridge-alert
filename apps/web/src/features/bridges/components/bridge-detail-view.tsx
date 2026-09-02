import { Button } from "@flood-bridge-alert/ui/components/button";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { Link, useParams } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

import { AlertHistoryCard } from "./alert-history-card";
import { BridgeLocationDialog } from "./bridge-location-dialog";
import { StatusBadge } from "./status-badge";
import { WaterLevelCard } from "./water-level-card";

export function BridgeDetailView() {
  useDocumentTitle("Chi tiết cầu tràn");
  const { id } = useParams<{ id: string }>();
  const bridgeId = id ?? "";
  const bridge = useQuery(
    orpc.bridge.getById.queryOptions({ input: { id: bridgeId } }),
  );
  const history = useQuery(
    orpc.bridge.history.queryOptions({ input: { id: bridgeId, limit: 100 } }),
  );
  const alerts = useQuery(
    orpc.bridge.alerts.queryOptions({ input: { id: bridgeId } }),
  );

  return (
    <>
      <Button
        variant="link"
        size="sm"
        className="mb-2 px-0"
        nativeButton={false}
        render={<Link to="/bridges" />}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách cầu
      </Button>

      {bridge.isLoading ? (
        <Skeleton className="mt-2 h-8 w-64" />
      ) : bridge.data ? (
        <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">
              {bridge.data.name}
            </h1>
            {bridge.data.location ? (
              <p className="text-muted-foreground text-sm">
                {bridge.data.location}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={bridge.data.latestReading?.status} />
            <BridgeLocationDialog
              bridge={{
                id: bridge.data.id,
                name: bridge.data.name,
                status: bridge.data.latestReading?.status,
                latitude: bridge.data.latitude,
                longitude: bridge.data.longitude,
              }}
            >
              <MapPin className="h-4 w-4" />
              Xem vị trí trên bản đồ
            </BridgeLocationDialog>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground">Không tìm thấy cầu này.</p>
      )}

      <div className="mb-6">
        <WaterLevelCard
          readings={history.data?.readings ?? []}
          threshold={history.data?.threshold ?? null}
          isLoading={history.isLoading}
        />
      </div>

      <AlertHistoryCard
        alerts={alerts.data ?? []}
        isLoading={alerts.isLoading}
      />
    </>
  );
}
