import { BridgeStatus } from "@flood-bridge-alert/db";

export function determineBridgeStatus(
	level: number,
	threshold: { safeMax: number; warningMax: number },
): BridgeStatus {
	if (level <= threshold.safeMax) return BridgeStatus.SAFE;
	if (level <= threshold.warningMax) return BridgeStatus.WARNING;
	return BridgeStatus.DANGER;
}
