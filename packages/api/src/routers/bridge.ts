import prisma from "@flood-bridge-alert/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../index";

function toBridgeSummary(bridge: {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  readings: { level: number; status: string; recordedAt: Date }[];
}) {
  const latestReading = bridge.readings[0] ?? null;
  return {
    id: bridge.id,
    name: bridge.name,
    location: bridge.location,
    latitude: bridge.latitude,
    longitude: bridge.longitude,
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

  history: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        limit: z.number().int().min(1).max(500).default(100),
      }),
    )
    .handler(async ({ input }) => {
      const bridge = await prisma.bridge.findUnique({
        where: { id: input.id },
        include: { threshold: true },
      });
      if (!bridge) {
        throw new ORPCError("NOT_FOUND");
      }
      const readings = await prisma.waterLevelReading.findMany({
        where: { bridgeId: input.id },
        orderBy: { recordedAt: "desc" },
        take: input.limit,
      });
      return { threshold: bridge.threshold, readings: readings.reverse() };
    }),

  alerts: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      return await prisma.alertHistory.findMany({
        where: { bridgeId: input.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),
};
