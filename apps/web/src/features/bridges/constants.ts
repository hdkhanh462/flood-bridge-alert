import type { BridgeStatus } from "./types";

// Trung tâm mặc định: Hà Nội. Toàn bộ hệ thống hiện chỉ theo dõi cầu tràn ở
// khu vực miền Bắc nên bản đồ bị giới hạn (maxBounds) trong khu vực này, tránh
// người dùng zoom/pan ra ngoài (hoặc thấy bản đồ thế giới khi container chưa
// có kích thước lúc khởi tạo — xem MapSizeFix trong bridge-map.tsx).
export const DEFAULT_MAP_CENTER: [number, number] = [21.0285, 105.8542];
export const NORTHERN_VIETNAM_BOUNDS: [[number, number], [number, number]] = [
	[19.5, 102.0],
	[23.5, 108.5],
];
export const NORTHERN_VIETNAM_MIN_ZOOM = 7;

export const MARKER_STATUS_COLORS: Record<string, string> = {
	SAFE: "#16a34a",
	WARNING: "#f59e0b",
	DANGER: "#dc2626",
};
export const DEFAULT_MARKER_COLOR = "#6b7280";

export const STATUS_BADGE_META: Record<
	BridgeStatus,
	{ label: string; variant: "success" | "warning" | "destructive" }
> = {
	SAFE: { label: "An toàn", variant: "success" },
	WARNING: { label: "Cảnh báo", variant: "warning" },
	DANGER: { label: "Nguy hiểm", variant: "destructive" },
};

export const SENSOR_STATUS_BADGE_META: Record<
	"ONLINE" | "OFFLINE" | "NEVER",
	{ label: string; variant: "success" | "destructive" | "outline" }
> = {
	ONLINE: { label: "Đang hoạt động", variant: "success" },
	OFFLINE: { label: "Mất kết nối", variant: "destructive" },
	NEVER: { label: "Chưa có dữ liệu", variant: "outline" },
};
