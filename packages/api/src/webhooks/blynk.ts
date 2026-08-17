import prisma, { type WaterLevelReading } from "@flood-bridge-alert/db";
import { z } from "zod";

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
	const bridge = await prisma.bridge.findUnique({
		where: { id: input.bridgeId },
	});
	if (!bridge) {
		throw new BridgeNotFoundError(`Bridge not found: ${input.bridgeId}`);
	}

	return await prisma.waterLevelReading.create({
		data: {
			bridgeId: input.bridgeId,
			level: input.level,
			recordedAt: input.recordedAt,
		},
	});
}
