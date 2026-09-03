#!/usr/bin/env node
// Sinh nhanh các giá trị bắt buộc còn thiếu trong .env.dev/.env.prod:
// BETTER_AUTH_SECRET, BLYNK_WEBHOOK_TOKEN, cặp VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY.
// Chỉ in ra stdout để tự copy vào .env tương ứng — không tự ghi đè file nào,
// tránh làm hỏng comment/format sẵn có trong .env.dev/.env.prod.
//
// Dùng: pnpm secrets:generate [better-auth-secret|blynk-token|vapid|all]
// Mặc định (không truyền gì) = all.
//
// Thuần Node.js (không gọi ra bash/openssl) để chạy nhất quán trên
// Windows/macOS/Linux — pnpm luôn đảm bảo `node` chạy được khi thực thi
// package script, khác với `bash <script>.sh` có thể không thấy đúng PATH
// chứa node trên Windows (Git Bash không load profile khi chạy không tương tác).
import { createECDH, randomBytes } from "node:crypto";

function generateBetterAuthSecret() {
  return randomBytes(32).toString("base64");
}

function generateBlynkToken() {
  return randomBytes(24).toString("hex");
}

function generateVapidKeys() {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    publicKey: ecdh.getPublicKey().toString("base64url"),
    privateKey: ecdh.getPrivateKey().toString("base64url"),
  };
}

function printVapidKeys() {
  const { publicKey, privateKey } = generateVapidKeys();
  console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
}

const target = process.argv[2] ?? "all";

switch (target) {
  case "better-auth-secret":
    console.log(`BETTER_AUTH_SECRET=${generateBetterAuthSecret()}`);
    break;
  case "blynk-token":
    console.log(`BLYNK_WEBHOOK_TOKEN=${generateBlynkToken()}`);
    break;
  case "vapid":
    printVapidKeys();
    break;
  case "all":
    console.log(`BETTER_AUTH_SECRET=${generateBetterAuthSecret()}`);
    console.log(`BLYNK_WEBHOOK_TOKEN=${generateBlynkToken()}`);
    printVapidKeys();
    break;
  default:
    console.error(
      "Usage: pnpm secrets:generate [better-auth-secret|blynk-token|vapid|all]",
    );
    process.exit(1);
}
