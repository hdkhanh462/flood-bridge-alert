#!/usr/bin/env bash
# Simulates a Blynk webhook call to test alerts/push notifications without real hardware.
#
# Required env vars (put them in a gitignored .env at the repo root instead of
# typing them inline, so the token doesn't end up in shell history):
#   BLYNK_WEBHOOK_URL    e.g. https://api.hoangduongkhanh.id.vn/webhooks/blynk
#   BLYNK_WEBHOOK_TOKEN  must match the server's BLYNK_WEBHOOK_TOKEN
#
# Usage:
#   ./scripts/simulate-blynk.sh <bridgeId> <level>

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$script_dir/.env" ]; then
	set -a
	# shellcheck source=/dev/null
	source "$script_dir/.env"
	set +a
fi

bridge_id="${1:-}"
level="${2:-}"

if [ -z "$bridge_id" ] || [ -z "$level" ]; then
	echo "Usage: $0 <bridgeId> <level>" >&2
	exit 1
fi

if [ -z "${BLYNK_WEBHOOK_URL:-}" ] || [ -z "${BLYNK_WEBHOOK_TOKEN:-}" ]; then
	echo "Error: BLYNK_WEBHOOK_URL and BLYNK_WEBHOOK_TOKEN env vars are required." >&2
	exit 1
fi

curl -sS -X POST "$BLYNK_WEBHOOK_URL" \
	-H "Content-Type: application/json" \
	-H "x-webhook-token: $BLYNK_WEBHOOK_TOKEN" \
	-d "{\"bridgeId\": \"$bridge_id\", \"level\": $level}" \
	-w '\nHTTP %{http_code}\n'
