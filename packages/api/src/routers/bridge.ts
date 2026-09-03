import prisma from "@flood-bridge-alert/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../index";

const NEARBY_RADIUS_KM = 20;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

  nearby: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .handler(async ({ input }) => {
      const bridges = await prisma.bridge.findMany({
        where: { latitude: { not: null }, longitude: { not: null } },
        include: {
          readings: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });
      return bridges
        .map((bridge) => ({
          ...toBridgeSummary(bridge),
          distanceKm: distanceKm(
            input.lat,
            input.lng,
            bridge.latitude as number,
            bridge.longitude as number,
          ),
        }))
        .filter((bridge) => bridge.distanceKm <= NEARBY_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);
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
