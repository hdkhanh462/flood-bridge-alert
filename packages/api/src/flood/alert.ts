import {
  type AlertHistory,
  BridgeStatus,
  type Prisma,
} from "@flood-bridge-alert/db";

const ALERT_REPEAT_COOLDOWN_MS = 30 * 60 * 1000;

export async function recordAlertIfNeeded(
  tx: Prisma.TransactionClient,
  bridgeId: string,
  status: BridgeStatus,
  occurredAt: Date,
): Promise<AlertHistory | null> {
  const lastAlert = await tx.alertHistory.findFirst({
    where: { bridgeId },
    orderBy: { createdAt: "desc" },
  });

  const statusChanged = !lastAlert || lastAlert.status !== status;
  const cooldownElapsed =
    lastAlert !== null &&
    occurredAt.getTime() - lastAlert.createdAt.getTime() >=
      ALERT_REPEAT_COOLDOWN_MS;
  // Chỉ nhắc lại khi vẫn đang cảnh báo/nguy hiểm và đã qua thời gian chờ, tránh spam khi trạng thái không đổi.
  const shouldRepeatAlert =
    !statusChanged && status !== BridgeStatus.SAFE && cooldownElapsed;

  if (!statusChanged && !shouldRepeatAlert) {
    return null;
  }

  return await tx.alertHistory.create({ data: { bridgeId, status } });
}
