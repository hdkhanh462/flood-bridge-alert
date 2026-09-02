import prisma from "@flood-bridge-alert/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { adminProcedure } from "../index";

const SENSOR_ONLINE_WINDOW_MS = 30 * 60 * 1000;

function toSensorStatus(lastSeenAt: Date | null) {
	if (!lastSeenAt) return "NEVER" as const;
	const isOnline = Date.now() - lastSeenAt.getTime() <= SENSOR_ONLINE_WINDOW_MS;
	return isOnline ? ("ONLINE" as const) : ("OFFLINE" as const);
}

export const adminRouter = {
	bridge: {
		list: adminProcedure.handler(async () => {
			const bridges = await prisma.bridge.findMany({
				orderBy: { name: "asc" },
				include: {
					threshold: true,
					readings: { orderBy: { recordedAt: "desc" }, take: 1 },
				},
			});
			return bridges.map((bridge) => {
				const latestReading = bridge.readings[0] ?? null;
				return {
					id: bridge.id,
					name: bridge.name,
					location: bridge.location,
					latitude: bridge.latitude,
					longitude: bridge.longitude,
					threshold: bridge.threshold,
					latestReading,
					sensorStatus: toSensorStatus(latestReading?.recordedAt ?? null),
				};
			});
		}),

		create: adminProcedure
			.input(
				z.object({
					name: z.string().min(1),
					location: z.string().min(1).optional(),
					latitude: z.number().min(-90).max(90).optional(),
					longitude: z.number().min(-180).max(180).optional(),
				}),
			)
			.handler(async ({ input }) => {
				return await prisma.bridge.create({
					data: {
						name: input.name,
						location: input.location,
						latitude: input.latitude,
						longitude: input.longitude,
					},
				});
			}),

		update: adminProcedure
			.input(
				z.object({
					id: z.string().min(1),
					name: z.string().min(1),
					location: z.string().min(1).optional(),
					latitude: z.number().min(-90).max(90).optional(),
					longitude: z.number().min(-180).max(180).optional(),
				}),
			)
			.handler(async ({ input }) => {
				try {
					return await prisma.bridge.update({
						where: { id: input.id },
						data: {
							name: input.name,
							location: input.location,
							latitude: input.latitude,
							longitude: input.longitude,
						},
					});
				} catch {
					throw new ORPCError("NOT_FOUND");
				}
			}),

		delete: adminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input }) => {
				try {
					await prisma.bridge.delete({ where: { id: input.id } });
				} catch {
					throw new ORPCError("NOT_FOUND");
				}
				return { success: true };
			}),
	},

	threshold: {
		upsert: adminProcedure
			.input(
				z.object({
					bridgeId: z.string().min(1),
					safeMax: z.number().finite(),
					warningMax: z.number().finite(),
				}),
			)
			.handler(async ({ input }) => {
				if (input.warningMax <= input.safeMax) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Ngưỡng cảnh báo phải lớn hơn ngưỡng an toàn",
					});
				}
				const bridge = await prisma.bridge.findUnique({
					where: { id: input.bridgeId },
				});
				if (!bridge) {
					throw new ORPCError("NOT_FOUND");
				}
				return await prisma.threshold.upsert({
					where: { bridgeId: input.bridgeId },
					create: {
						bridgeId: input.bridgeId,
						safeMax: input.safeMax,
						warningMax: input.warningMax,
					},
					update: { safeMax: input.safeMax, warningMax: input.warningMax },
				});
			}),
	},

	alertHistory: {
		list: adminProcedure
			.input(z.object({ bridgeId: z.string().min(1).optional() }).optional())
			.handler(async ({ input }) => {
				return await prisma.alertHistory.findMany({
					where: input?.bridgeId ? { bridgeId: input.bridgeId } : undefined,
					orderBy: { createdAt: "desc" },
					take: 50,
					include: { bridge: { select: { name: true } } },
				});
			}),
	},

	pushSubscription: {
		list: adminProcedure.handler(async () => {
			return await prisma.pushSubscription.findMany({
				orderBy: { createdAt: "desc" },
				take: 100,
				include: {
					user: { select: { email: true, isAnonymous: true } },
					bridges: { select: { id: true, name: true } },
				},
			});
		}),
	},
};
