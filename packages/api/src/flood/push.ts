import prisma, { type AlertHistory } from "@flood-bridge-alert/db";
import { env } from "@flood-bridge-alert/env/server";
import webpush from "web-push";

import { BRIDGE_STATUS_LABEL } from "./status";

webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export async function sendAlertPush(
  bridgeName: string,
  alert: AlertHistory,
): Promise<void> {
  // Subscription không chọn cầu nào (bridges rỗng) nghĩa là muốn nhận cảnh báo của TẤT CẢ các cầu.
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { bridges: { none: {} } },
        { bridges: { some: { id: alert.bridgeId } } },
      ],
    },
  });
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: "Cảnh báo cầu tràn",
    body: `${bridgeName}: ${BRIDGE_STATUS_LABEL[alert.status]}`,
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
      } catch (error) {
        // Subscription hết hạn/bị thu hồi ở phía trình duyệt, dọn khỏi DB để tránh gửi lặp lỗi.
        if (
          error instanceof webpush.WebPushError &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await prisma.pushSubscription
            .delete({ where: { id: subscription.id } })
            .catch(() => {});
        }
      }
    }),
  );
}
