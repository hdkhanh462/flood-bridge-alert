import { createContext } from "@flood-bridge-alert/api/context";
import { appRouter } from "@flood-bridge-alert/api/routers/index";
import { auth } from "@flood-bridge-alert/auth";
import { env } from "@flood-bridge-alert/env/server";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

import { blynkWebhookRouter } from "./webhooks/blynk";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use(async (req, res, next) => {
  const rpcResult = await rpcHandler.handle(req, res, {
    prefix: "/rpc",
    context: await createContext({ req }),
  });
  if (rpcResult.matched) return;

  const apiResult = await apiHandler.handle(req, res, {
    prefix: "/api-reference",
    context: await createContext({ req }),
  });
  if (apiResult.matched) return;

  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody =
        buf.toString("utf-8");
    },
  }),
);

app.use("/webhooks", blynkWebhookRouter);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Body không phải JSON hợp lệ (ví dụ template webhook của Blynk cấu hình sai
// định dạng) — log lại nội dung thô để chẩn đoán thay vì chỉ thấy stack trace
// của JSON.parse.
app.use(
  (
    err: unknown,
    req: express.Request & { rawBody?: string },
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      console.error("Invalid JSON body received:", req.rawBody);
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    next(err);
  },
);

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
