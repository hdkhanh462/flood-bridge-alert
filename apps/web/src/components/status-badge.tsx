import { Badge } from "@flood-bridge-alert/ui/components/badge";

type BridgeStatus = "SAFE" | "WARNING" | "DANGER";

const STATUS_META: Record<
	BridgeStatus,
	{ label: string; variant: "success" | "warning" | "destructive" }
> = {
	SAFE: { label: "An toàn", variant: "success" },
	WARNING: { label: "Cảnh báo", variant: "warning" },
	DANGER: { label: "Nguy hiểm", variant: "destructive" },
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
	const meta =
		status && status in STATUS_META
			? STATUS_META[status as BridgeStatus]
			: null;
	if (!meta) {
		return <Badge variant="outline">Chưa có dữ liệu</Badge>;
	}
	return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const SENSOR_STATUS_META: Record<
	"ONLINE" | "OFFLINE" | "NEVER",
	{ label: string; variant: "success" | "destructive" | "outline" }
> = {
	ONLINE: { label: "Đang hoạt động", variant: "success" },
	OFFLINE: { label: "Mất kết nối", variant: "destructive" },
	NEVER: { label: "Chưa có dữ liệu", variant: "outline" },
};

export function SensorStatusBadge({ status }: { status: string }) {
	const meta =
		status in SENSOR_STATUS_META
			? SENSOR_STATUS_META[status as keyof typeof SENSOR_STATUS_META]
			: null;
	if (!meta) {
		return <Badge variant="outline">{status}</Badge>;
	}
	return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
