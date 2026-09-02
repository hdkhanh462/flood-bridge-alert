import "leaflet/dist/leaflet.css";

import { Button } from "@flood-bridge-alert/ui/components/button";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";

import { DEFAULT_MAP_CENTER } from "./bridge-map";

const pinIcon = L.divIcon({
	className: "location-picker-pin",
	html: `<svg width="28" height="34" viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg">
		<path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 20 14 20s14-9.5 14-20C28 6.27 21.73 0 14 0z" fill="#2563eb"/>
		<circle cx="14" cy="14" r="5.5" fill="white"/>
	</svg>`,
	iconSize: [28, 34],
	iconAnchor: [14, 34],
	popupAnchor: [0, -30],
});

type Coords = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (coords: Coords) => void }) {
	useMapEvents({
		click(e) {
			onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
		},
	});
	return null;
}

function MapRecenter({ center }: { center: [number, number] }) {
	const map = useMap();
	useEffect(() => {
		map.setView(center);
	}, [center, map]);
	return null;
}

export function LocationPicker({
	value,
	onChange,
}: {
	value: Coords | null;
	onChange: (value: Coords) => void;
}) {
	const center = useMemo<[number, number]>(
		() => (value ? [value.lat, value.lng] : DEFAULT_MAP_CENTER),
		[value],
	);

	function handleUseCurrentLocation() {
		if (!navigator.geolocation) {
			toast.error("Trình duyệt không hỗ trợ định vị");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => {
				onChange({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			() => {
				toast.error(
					"Không thể lấy vị trí hiện tại. Vui lòng cấp quyền định vị.",
				);
			},
		);
	}

	return (
		<div className="space-y-2">
			<div className="overflow-hidden rounded-md border">
				<MapContainer
					center={center}
					zoom={value ? 15 : 6}
					className="isolate z-0"
					style={{ height: 240, width: "100%" }}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<ClickHandler onPick={onChange} />
					<MapRecenter center={center} />
					{value ? (
						<Marker
							position={[value.lat, value.lng]}
							icon={pinIcon}
							draggable
							eventHandlers={{
								dragend: (e) => {
									const position = (e.target as L.Marker).getLatLng();
									onChange({ lat: position.lat, lng: position.lng });
								},
							}}
						/>
					) : null}
				</MapContainer>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-muted-foreground text-xs">
					{value
						? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
						: "Chưa chọn vị trí — nhấp vào bản đồ để đặt điểm"}
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleUseCurrentLocation}
				>
					<LocateFixed className="h-4 w-4" />
					Vị trí hiện tại
				</Button>
			</div>
		</div>
	);
}
