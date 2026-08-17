import prisma from "@flood-bridge-alert/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../index";

function toBridgeSummary(bridge: {
	id: string;
	name: string;
	location: string | null;
	readings: { level: number; status: string; recordedAt: Date }[];
}) {
	const latestReading = bridge.readings[0] ?? null;
	return {
		id: bridge.id,
		name: bridge.name,
		location: bridge.location,
		latestReading,
	};
}

export const bridgeRouter = {
	list: publicProcedure.handler(async () => {
		const bridges = await prisma.bridge.findMany({
			orderBy: { name: "asc" },
			include: {
				readings: { orderBy: { recordedAt: "desc" }, take: 1 },
			},
		});
		return bridges.map(toBridgeSummary);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().min(1) }))
		.handler(async ({ input }) => {
			const bridge = await prisma.bridge.findUnique({
				where: { id: input.id },
				include: {
					readings: { orderBy: { recordedAt: "desc" }, take: 1 },
				},
			});
			if (!bridge) {
				throw new ORPCError("NOT_FOUND");
			}
			return toBridgeSummary(bridge);
		}),
};
