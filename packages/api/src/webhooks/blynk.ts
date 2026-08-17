import prisma, {
	BridgeStatus,
	type WaterLevelReading,
} from "@flood-bridge-alert/db";
import { z } from "zod";

import { recordAlertIfNeeded } from "../flood/alert";
import { determineBridgeStatus } from "../flood/status";

export const blynkWebhookInputSchema = z.object({
	bridgeId: z.string().min(1),
	level: z.number().finite(),
	recordedAt: z.coerce.date().optional(),
});

export type BlynkWebhookInput = z.infer<typeof blynkWebhookInputSchema>;

export class BridgeNotFoundError extends Error {}

export async function ingestBlynkReading(
	input: BlynkWebhookInput,
): Promise<WaterLevelReading> {
	return await prisma.$transaction(async (tx) => {
		const bridge = await tx.bridge.findUnique({
			where: { id: input.bridgeId },
			include: { threshold: true },
		});
		if (!bridge) {
			throw new BridgeNotFoundError(`Bridge not found: ${input.bridgeId}`);
		}

		const recordedAt = input.recordedAt ?? new Date();
		// Chưa cấu hình ngưỡng thì không thể xác định mức độ nguy hiểm, mặc định An toàn và bỏ qua cảnh báo.
		const status = bridge.threshold
			? determineBridgeStatus(input.level, bridge.threshold)
			: BridgeStatus.SAFE;

		const reading = await tx.waterLevelReading.create({
			data: {
				bridgeId: input.bridgeId,
				level: input.level,
				status,
				recordedAt,
			},
		});

		if (bridge.threshold) {
			await recordAlertIfNeeded(tx, input.bridgeId, status, recordedAt);
		}

		return reading;
	});
}
