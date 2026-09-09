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
  // Blynk template variable (ví dụ device_pinValue) có thể được serialize
  // thành chuỗi thay vì số tuỳ theo cấu hình webhook — coerce để chấp nhận cả hai.
  // Đơn vị: CENTIMET — khớp với giá trị cảm biến siêu âm A02YYUW gửi lên V1
  // (xem firmware ESP32). Không phải mét như sensorHeight/threshold ở dưới.
  level: z.coerce.number().finite(),
  recordedAt: z.coerce.date().optional(),
  // Cả ESP32 (gọi thẳng) lẫn Blynk automation (webhook khi datastream V1 đổi) đều
  // gọi chung endpoint này; field này chỉ để ghi log phân biệt nguồn, không dùng
  // để xác thực hay thay đổi cách xử lý.
  source: z.string().optional(),
});

export type BlynkWebhookInput = z.infer<typeof blynkWebhookInputSchema>;

export class BridgeNotFoundError extends Error {}

export async function ingestBlynkReading(
  input: BlynkWebhookInput,
): Promise<WaterLevelReading> {
  console.log(
    `[blynk webhook] Nhận từ ${input.source ?? "(không rõ nguồn)"}:`,
    input,
  );

  const result = await prisma.$transaction(async (tx) => {
    const bridge = await tx.bridge.findUnique({
      where: { id: input.bridgeId },
      include: { threshold: true },
    });
    if (!bridge) {
      throw new BridgeNotFoundError(`Bridge not found: ${input.bridgeId}`);
    }

    const recordedAt = input.recordedAt ?? new Date();
    // Cảm biến siêu âm đo khoảng cách tới mặt nước bằng CM (giảm khi nước
    // dâng); nếu cầu có cấu hình sensorHeight (chiều cao lắp đặt, đơn vị MÉT
    // — xem modal "Cấu hình cảm biến" ở admin), quy đổi cm sang mét rồi trừ
    // ngược lại thành mực nước thực tế (tăng khi nước dâng) trước khi lưu/so
    // ngưỡng. Không có sensorHeight nghĩa là cảm biến đã tự gửi thẳng mực
    // nước (mét), dùng nguyên giá trị.
    const level =
      bridge.sensorHeight != null
        ? bridge.sensorHeight - input.level / 100
        : input.level;
    // Chưa cấu hình ngưỡng thì không thể xác định mức độ nguy hiểm, mặc định An toàn và bỏ qua cảnh báo.
    const status = bridge.threshold
      ? determineBridgeStatus(level, bridge.threshold)
      : BridgeStatus.SAFE;

    console.log(
      `[blynk webhook] Cầu "${bridge.name}" (${bridge.id}) | sensorHeight=${bridge.sensorHeight ?? "null"} | ` +
        `level nhận (input.level)=${input.level} -> level lưu DB=${level} | status=${status}`,
    );

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
  // Chỉ báo khi vượt ngưỡng (WARNING/DANGER) — trạng thái SAFE vẫn lưu vào lịch sử để hiển thị
  // "trở lại an toàn" nhưng không cần đẩy thông báo, tránh làm phiền khi cầu vẫn an toàn.
  if (result.alert && result.alert.status !== BridgeStatus.SAFE) {
    await sendAlertPush(result.bridgeName, result.alert);
  }

  return result.reading;
}
