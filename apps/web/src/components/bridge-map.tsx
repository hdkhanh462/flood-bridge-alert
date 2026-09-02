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

// Trung tâm mặc định: Hà Nội. Toàn bộ hệ thống hiện chỉ theo dõi cầu tràn ở
// khu vực miền Bắc nên bản đồ bị giới hạn (maxBounds) trong khu vực này, tránh
// người dùng zoom/pan ra ngoài (hoặc thấy bản đồ thế giới khi container chưa
// có kích thước lúc khởi tạo — xem MapSizeFix bên dưới).
export const DEFAULT_MAP_CENTER: [number, number] = [21.0285, 105.8542];
export const NORTHERN_VIETNAM_BOUNDS: [[number, number], [number, number]] = [
	[19.5, 102.0],
	[23.5, 108.5],
];
export const NORTHERN_VIETNAM_MIN_ZOOM = 7;

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

const STATUS_COLORS: Record<string, string> = {
	SAFE: "#16a34a",
	WARNING: "#f59e0b",
	DANGER: "#dc2626",
};
const DEFAULT_MARKER_COLOR = "#6b7280";

type BridgeMarker = {
	id: string;
	name: string;
	status?: string | null;
	latitude: number;
	longitude: number;
};

export function BridgeMap({
	markers,
	height = 320,
	className,
}: {
	markers: BridgeMarker[];
	height?: number;
	className?: string;
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
							STATUS_COLORS[marker.status ?? ""] ?? DEFAULT_MARKER_COLOR,
						fillOpacity: 1,
					}}
				>
					<Popup>
						<div className="space-y-1">
							<p className="font-medium">{marker.name}</p>
							<Link
								to={`/bridges/${marker.id}`}
								className="text-primary text-sm underline-offset-4 hover:underline"
							>
								Xem chi tiết
							</Link>
						</div>
					</Popup>
				</CircleMarker>
			))}
		</MapContainer>
	);
}
