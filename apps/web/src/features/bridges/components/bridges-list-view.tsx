import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@flood-bridge-alert/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, Waves } from "lucide-react";
import { useEffect } from "react";

import { NotificationToggle } from "@/features/notifications/components/notification-toggle";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

import { NEARBY_RADIUS_KM } from "../constants";
import { useGeolocation } from "../hooks/use-geolocation";
import { BridgeCard } from "./bridge-card";
import { BridgeMap } from "./bridge-map";

export function BridgesListView() {
  useDocumentTitle("Trạng thái cầu tràn");
  const { state: location, request: requestLocation } = useGeolocation();

  useEffect(() => {
    if (location.status === "idle") requestLocation();
  }, [location.status, requestLocation]);

  const bridges = useQuery({
    ...orpc.bridge.nearby.queryOptions({
      input: location.status === "granted" ? location.coords : { lat: 0, lng: 0 },
    }),
    enabled: location.status === "granted",
  });

  const locatedBridges =
    bridges.data?.filter(
      (bridge) => bridge.latitude != null && bridge.longitude != null,
    ) ?? [];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl tracking-tight">
          Trạng thái cầu tràn
        </h1>
        <NotificationToggle />
      </div>

      {location.status === "idle" || location.status === "loading" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LocateFixed />
            </EmptyMedia>
            <EmptyTitle>Đang xác định vị trí của bạn...</EmptyTitle>
            <EmptyDescription>
              Chỉ hiển thị các cầu tràn trong bán kính {NEARBY_RADIUS_KM}km
              quanh bạn.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : location.status === "unsupported" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LocateFixed />
            </EmptyMedia>
            <EmptyTitle>Trình duyệt không hỗ trợ định vị</EmptyTitle>
            <EmptyDescription>
              Vui lòng dùng trình duyệt khác để xem các cầu tràn gần bạn.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : location.status === "denied" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LocateFixed />
            </EmptyMedia>
            <EmptyTitle>Chưa thể lấy vị trí của bạn</EmptyTitle>
            <EmptyDescription>
              Hãy cấp quyền truy cập vị trí để xem các cầu tràn trong bán kính{" "}
              {NEARBY_RADIUS_KM}km quanh bạn.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={requestLocation}>
            <LocateFixed className="h-4 w-4" />
            Thử lại
          </Button>
        </Empty>
      ) : bridges.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : bridges.data?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Waves />
            </EmptyMedia>
            <EmptyTitle>Không có cầu tràn nào gần bạn</EmptyTitle>
            <EmptyDescription>
              Không tìm thấy cầu tràn nào trong bán kính {NEARBY_RADIUS_KM}km
              quanh vị trí hiện tại của bạn.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Tabs defaultValue="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="map">Bản đồ</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid gap-4 sm:grid-cols-2">
              {bridges.data?.map((bridge) => (
                <BridgeCard key={bridge.id} bridge={bridge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="overflow-hidden rounded-md border">
              <BridgeMap
                markers={locatedBridges.map((bridge) => ({
                  id: bridge.id,
                  name: bridge.name,
                  status: bridge.latestReading?.status,
                  latitude: bridge.latitude as number,
                  longitude: bridge.longitude as number,
                }))}
                height={420}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
