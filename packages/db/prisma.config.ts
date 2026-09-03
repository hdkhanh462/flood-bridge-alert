import path from "node:path";

import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Thử .env.dev trước (máy dev), rồi .env.prod (VPS, nếu ai đó chạy prisma CLI
// trực tiếp trên host) — dotenv không ghi đè biến đã nạp từ file trước, nên
// file nào tồn tại trên máy đang chạy sẽ được dùng, không cần biết NODE_ENV.
dotenv.config({
  path: ["../../apps/server/.env.dev", "../../apps/server/.env.prod"],
});

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
