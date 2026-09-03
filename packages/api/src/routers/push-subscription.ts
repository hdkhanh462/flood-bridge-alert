import prisma from "@flood-bridge-alert/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure } from "../index";

const subscriptionInput = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

async function assertOwnedByCaller(endpoint: string, userId: string) {
  const subscription = await prisma.pushSubscription.findUnique({
    where: { endpoint },
  });
  if (!subscription || subscription.userId !== userId) {
    throw new ORPCError("NOT_FOUND");
  }
}

export const pushSubscriptionRouter = {
  subscribe: protectedProcedure
    .input(subscriptionInput)
    .handler(async ({ input, context }) => {
      await prisma.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        create: {
          userId: context.session.user.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
        update: {
          userId: context.session.user.id,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
      });
      return { success: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: input.endpoint, userId: context.session.user.id },
      });
      return { success: true };
    }),

  // Danh sách bridgeId đang chọn theo dõi; mảng rỗng nghĩa là nhận cảnh báo của TẤT CẢ các cầu.
  myInterests: protectedProcedure
    .input(z.object({ endpoint: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await assertOwnedByCaller(input.endpoint, context.session.user.id);
      const subscription = await prisma.pushSubscription.findUnique({
        where: { endpoint: input.endpoint },
        include: { bridges: { select: { id: true } } },
      });
      return {
        bridgeIds: subscription?.bridges.map((bridge) => bridge.id) ?? [],
      };
    }),

  updateInterests: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().min(1),
        bridgeIds: z.array(z.string().min(1)),
      }),
    )
    .handler(async ({ input, context }) => {
      await assertOwnedByCaller(input.endpoint, context.session.user.id);
      await prisma.pushSubscription.update({
        where: { endpoint: input.endpoint },
        data: { bridges: { set: input.bridgeIds.map((id) => ({ id })) } },
      });
      return { success: true };
    }),

  // Danh sách cầu đang bị tạm tắt thông báo (còn hiệu lực) cho subscription này.
  myMutes: protectedProcedure
    .input(z.object({ endpoint: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await assertOwnedByCaller(input.endpoint, context.session.user.id);
      const subscription = await prisma.pushSubscription.findUnique({
        where: { endpoint: input.endpoint },
        include: { mutes: { where: { mutedUntil: { gt: new Date() } } } },
      });
      return {
        mutes:
          subscription?.mutes.map((mute) => ({
            bridgeId: mute.bridgeId,
            mutedUntil: mute.mutedUntil,
          })) ?? [],
      };
    }),

  muteBridge: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().min(1),
        bridgeId: z.string().min(1),
        hours: z.number().int().min(1).max(24),
      }),
    )
    .handler(async ({ input, context }) => {
      await assertOwnedByCaller(input.endpoint, context.session.user.id);
      const subscription = await prisma.pushSubscription.findUniqueOrThrow({
        where: { endpoint: input.endpoint },
      });
      const mutedUntil = new Date(Date.now() + input.hours * 60 * 60 * 1000);
      await prisma.pushSubscriptionMute.upsert({
        where: {
          pushSubscriptionId_bridgeId: {
            pushSubscriptionId: subscription.id,
            bridgeId: input.bridgeId,
          },
        },
        create: {
          pushSubscriptionId: subscription.id,
          bridgeId: input.bridgeId,
          mutedUntil,
        },
        update: { mutedUntil },
      });
      return { success: true, mutedUntil };
    }),

  unmuteBridge: protectedProcedure
    .input(
      z.object({ endpoint: z.string().min(1), bridgeId: z.string().min(1) }),
    )
    .handler(async ({ input, context }) => {
      await assertOwnedByCaller(input.endpoint, context.session.user.id);
      const subscription = await prisma.pushSubscription.findUniqueOrThrow({
        where: { endpoint: input.endpoint },
      });
      await prisma.pushSubscriptionMute.deleteMany({
        where: {
          pushSubscriptionId: subscription.id,
          bridgeId: input.bridgeId,
        },
      });
      return { success: true };
    }),
};
