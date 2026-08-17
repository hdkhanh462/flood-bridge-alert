import prisma from "@flood-bridge-alert/db";
import { z } from "zod";

import { protectedProcedure } from "../index";

const subscriptionInput = z.object({
	endpoint: z.string().min(1),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1),
	}),
});

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
};
