import "leaflet/dist/leaflet.css";

import { cn } from "@flood-bridge-alert/ui/lib/utils";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router";

export const DEFAULT_MAP_CENTER: [number, number] = [10.8231, 106.6297];

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
			zoom={markers.length > 0 ? 13 : 6}
			className={cn("isolate z-0", className)}
			style={{ height, width: "100%" }}
		>
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
