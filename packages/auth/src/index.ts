import { createPrismaClient } from "@flood-bridge-alert/db";
import { env } from "@flood-bridge-alert/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { admin, anonymous } from "better-auth/plugins";

export function createAuth() {
  const prisma = createPrismaClient();

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    // better-auth đã tự chặn tự ban/tự xoá chính mình (YOU_CANNOT_BAN_YOURSELF,
    // YOU_CANNOT_REMOVE_YOURSELF) nhưng không chặn tự đổi role — admin có thể
    // vô tình tự bỏ quyền admin của chính mình và bị khoá khỏi trang quản trị.
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/admin/set-role") return;
        const session = await getSessionFromCtx(ctx);
        if (ctx.body?.userId === session?.user.id) {
          throw new APIError("BAD_REQUEST", {
            message: "Không thể tự thay đổi vai trò của chính mình.",
          });
        }
      }),
    },
    plugins: [admin(), anonymous()],
  });
}

export const auth = createAuth();
