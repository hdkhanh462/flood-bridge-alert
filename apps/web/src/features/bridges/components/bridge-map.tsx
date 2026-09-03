import "leaflet/dist/leaflet.css";

import { cn } from "@flood-bridge-alert/ui/lib/utils";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Link } from "react-router";

import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MARKER_COLOR,
  MARKER_STATUS_COLORS,
  NORTHERN_VIETNAM_BOUNDS,
  NORTHERN_VIETNAM_MIN_ZOOM,
} from "../constants";
import type { BridgeMapMarker } from "../types";
import { formatReadingTime } from "../utils";
import { StatusBadge } from "./status-badge";

// Leaflet tính sai kích thước nếu khởi tạo lúc container đang ẩn (tab/dialog
// chưa active) — ResizeObserver báo lại cho map ngay khi container có kích
// thước thật, tránh hiện tượng bản đồ bị zoom-out bất thường (như thế giới).
export function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function BridgeMap({
  markers,
  height = 320,
  className,
  showDetailLink = true,
}: {
  markers: BridgeMapMarker[];
  height?: number;
  className?: string;
  showDetailLink?: boolean;
}) {
  const center: [number, number] =
    markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : DEFAULT_MAP_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={markers.length > 0 ? 13 : NORTHERN_VIETNAM_MIN_ZOOM}
      minZoom={NORTHERN_VIETNAM_MIN_ZOOM}
      maxBounds={NORTHERN_VIETNAM_BOUNDS}
      maxBoundsViscosity={1.0}
      className={cn("isolate z-0", className)}
      style={{ height, width: "100%" }}
    >
      <MapSizeFix />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.latitude, marker.longitude]}
          radius={10}
          pathOptions={{
            color: "#fff",
            weight: 2,
            fillColor:
              MARKER_STATUS_COLORS[marker.status ?? ""] ?? DEFAULT_MARKER_COLOR,
            fillOpacity: 1,
          }}
        >
          <Popup>
            <div className="space-y-1.5 min-w-40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium m-0! leading-none">{marker.name}</p>
                <StatusBadge status={marker.status} />
              </div>
              {marker.location ? (
                <p className="text-muted-foreground text-sm m-0!">
                  {marker.location}
                </p>
              ) : null}
              {marker.latestReading ? (
                <p className="text-sm m-0!">
                  Mực nước:{" "}
                  <span className="font-medium">
                    {marker.latestReading.level} m
                  </span>{" "}
                  · {formatReadingTime(marker.latestReading.recordedAt)}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm m-0!">
                  Chưa nhận được dữ liệu mực nước.
                </p>
              )}
              {showDetailLink ? (
                <Link
                  to={`/bridges/${marker.id}`}
                  className="text-primary text-sm underline-offset-4 hover:underline"
                >
                  Xem chi tiết
                </Link>
              ) : null}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
