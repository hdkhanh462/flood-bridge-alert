import prisma from "@flood-bridge-alert/db";
import { z } from "zod";

import { publicProcedure } from "../index";

const subscriptionInput = z.object({
	endpoint: z.string().min(1),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1),
	}),
});

export const pushSubscriptionRouter = {
	subscribe: publicProcedure
		.input(subscriptionInput)
		.handler(async ({ input }) => {
			await prisma.pushSubscription.upsert({
				where: { endpoint: input.endpoint },
				create: {
					endpoint: input.endpoint,
					p256dh: input.keys.p256dh,
					auth: input.keys.auth,
				},
				update: {
					p256dh: input.keys.p256dh,
					auth: input.keys.auth,
				},
			});
			return { success: true };
		}),

	unsubscribe: publicProcedure
		.input(z.object({ endpoint: z.string().min(1) }))
		.handler(async ({ input }) => {
			await prisma.pushSubscription.deleteMany({
				where: { endpoint: input.endpoint },
			});
			return { success: true };
		}),
};
