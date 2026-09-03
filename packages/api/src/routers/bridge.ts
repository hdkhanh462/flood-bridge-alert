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
      const [bridges, total] = await Promise.all([
        prisma.bridge.findMany({
          where: { latitude: { not: null }, longitude: { not: null } },
          include: {
            readings: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        }),
        prisma.bridge.count(),
      ]);
      const items = bridges
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
      // total = tổng số cầu trong hệ thống (không lọc theo bán kính), giúp UI
      // phân biệt "hệ thống chưa có cầu nào" với "không có cầu nào gần bạn".
      return { items, total };
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().trim().max(200).optional(),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const where = input.query
        ? { name: { contains: input.query, mode: "insensitive" as const } }
        : {};
      const [bridges, total] = await Promise.all([
        prisma.bridge.findMany({
          where,
          orderBy: { name: "asc" },
          skip: input.offset,
          take: input.limit,
          include: {
            readings: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        }),
        prisma.bridge.count({ where }),
      ]);
      return {
        items: bridges.map(toBridgeSummary),
        hasMore: input.offset + bridges.length < total,
      };
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
