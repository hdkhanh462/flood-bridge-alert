import prisma, {
  BridgeStatus,
  type WaterLevelReading,
} from "@flood-bridge-alert/db";
import { z } from "zod";

import { recordAlertIfNeeded } from "../flood/alert";
import { sendAlertPush } from "../flood/push";
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
  const result = await prisma.$transaction(async (tx) => {
    const bridge = await tx.bridge.findUnique({
      where: { id: input.bridgeId },
      include: { threshold: true },
    });
    if (!bridge) {
      throw new BridgeNotFoundError(`Bridge not found: ${input.bridgeId}`);
    }

    const recordedAt = input.recordedAt ?? new Date();
    // Cảm biến siêu âm đo khoảng cách tới mặt nước (giảm khi nước dâng); nếu
    // cầu có cấu hình sensorHeight (chiều cao lắp đặt), quy đổi ngược lại
    // thành mực nước thực tế (tăng khi nước dâng) trước khi lưu/so ngưỡng.
    const level =
      bridge.sensorHeight != null
        ? bridge.sensorHeight - input.level
        : input.level;
    // Chưa cấu hình ngưỡng thì không thể xác định mức độ nguy hiểm, mặc định An toàn và bỏ qua cảnh báo.
    const status = bridge.threshold
      ? determineBridgeStatus(level, bridge.threshold)
      : BridgeStatus.SAFE;

    const reading = await tx.waterLevelReading.create({
      data: {
        bridgeId: input.bridgeId,
        level,
        status,
        recordedAt,
      },
    });

    const alert = bridge.threshold
      ? await recordAlertIfNeeded(tx, input.bridgeId, status, recordedAt)
      : null;

    return { reading, alert, bridgeName: bridge.name };
  });

  // Gửi push ngoài transaction vì đây là I/O bên ngoài, không nên giữ transaction DB chờ nó.
  if (result.alert) {
    await sendAlertPush(result.bridgeName, result.alert);
  }

  return result.reading;
}
