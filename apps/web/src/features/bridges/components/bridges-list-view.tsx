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
import { BridgeSearchList } from "./bridge-search-list";

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
    bridges.data?.items.filter(
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
      ) : location.status === "unsupported" || location.status === "denied" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/50 px-4 py-3">
            <p className="text-muted-foreground text-sm">
              {location.status === "unsupported"
                ? "Trình duyệt không hỗ trợ định vị nên không thể lọc cầu tràn gần bạn."
                : "Chưa thể lấy vị trí của bạn nên không thể lọc cầu tràn gần bạn."}
            </p>
            {location.status === "denied" ? (
              <Button variant="outline" size="sm" onClick={requestLocation}>
                <LocateFixed className="h-4 w-4" />
                Thử lại
              </Button>
            ) : null}
          </div>
          <BridgeSearchList />
        </div>
      ) : bridges.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : bridges.isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Waves />
            </EmptyMedia>
            <EmptyTitle>Không thể tải danh sách cầu tràn</EmptyTitle>
            <EmptyDescription>
              Đã có lỗi khi kết nối máy chủ. Vui lòng thử lại.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => bridges.refetch()}>
            Thử lại
          </Button>
        </Empty>
      ) : bridges.data?.total === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Waves />
            </EmptyMedia>
            <EmptyTitle>Chưa có cầu tràn nào</EmptyTitle>
            <EmptyDescription>
              Quản trị viên chưa thêm cầu tràn nào vào hệ thống.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : bridges.data?.items.length === 0 ? (
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
              {bridges.data?.items.map((bridge) => (
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
