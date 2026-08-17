import { BridgeStatus } from "@flood-bridge-alert/db";

export const BRIDGE_STATUS_LABEL: Record<BridgeStatus, string> = {
	[BridgeStatus.SAFE]: "An toàn",
	[BridgeStatus.WARNING]: "Cảnh báo",
	[BridgeStatus.DANGER]: "Nguy hiểm",
};

export function determineBridgeStatus(
	level: number,
	threshold: { safeMax: number; warningMax: number },
): BridgeStatus {
	if (level <= threshold.safeMax) return BridgeStatus.SAFE;
	if (level <= threshold.warningMax) return BridgeStatus.WARNING;
	return BridgeStatus.DANGER;
}
