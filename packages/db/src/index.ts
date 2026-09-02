import { env } from "@flood-bridge-alert/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

export type {
  AlertHistory,
  Prisma,
  WaterLevelReading,
} from "../prisma/generated/client";
export { BridgeStatus } from "../prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
