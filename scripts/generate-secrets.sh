#!/usr/bin/env bash
# Sinh nhanh các giá trị bắt buộc còn thiếu trong .env.dev/.env.prod:
# BETTER_AUTH_SECRET, BLYNK_WEBHOOK_TOKEN, cặp VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY.
# Chỉ in ra stdout để tự copy vào .env tương ứng — không tự ghi đè file nào,
# tránh làm hỏng comment/format sẵn có trong .env.dev/.env.prod.
#
# Dùng: ./scripts/generate-secrets.sh [better-auth-secret|blynk-token|vapid|all]
# Mặc định (không truyền gì) = all.

set -euo pipefail

generate_better_auth_secret() {
	openssl rand -base64 32
}

generate_blynk_token() {
	openssl rand -hex 24
}

generate_vapid_keys() {
	node -e '
		const crypto = require("node:crypto");
		const ecdh = crypto.createECDH("prime256v1");
		ecdh.generateKeys();
		console.log("VAPID_PUBLIC_KEY=" + ecdh.getPublicKey().toString("base64url"));
		console.log("VAPID_PRIVATE_KEY=" + ecdh.getPrivateKey().toString("base64url"));
	'
}

target="${1:-all}"

case "$target" in
	better-auth-secret)
		echo "BETTER_AUTH_SECRET=$(generate_better_auth_secret)"
		;;
	blynk-token)
		echo "BLYNK_WEBHOOK_TOKEN=$(generate_blynk_token)"
		;;
	vapid)
		generate_vapid_keys
		;;
	all)
		echo "BETTER_AUTH_SECRET=$(generate_better_auth_secret)"
		echo "BLYNK_WEBHOOK_TOKEN=$(generate_blynk_token)"
		generate_vapid_keys
		;;
	*)
		echo "Usage: $0 [better-auth-secret|blynk-token|vapid|all]" >&2
		exit 1
		;;
esac
