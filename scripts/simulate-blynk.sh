#!/usr/bin/env bash
# Simulates a Blynk webhook call to test alerts/push notifications without real hardware.
#
# Required env vars — auto-loaded from infra/env/.env.prod (falls back to
# infra/env/.env.dev if prod doesn't exist), or export them yourself:
#   BLYNK_WEBHOOK_URL    e.g. https://api.hoangduongkhanh.id.vn/webhooks/blynk
#   BLYNK_WEBHOOK_TOKEN  must match the server's BLYNK_WEBHOOK_TOKEN
#
# Usage:
#   ./scripts/simulate-blynk.sh <bridgeId> <level>

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$script_dir/infra/env/.env.prod" ]; then
	set -a
	# shellcheck source=/dev/null
	source "$script_dir/infra/env/.env.prod"
	set +a
elif [ -f "$script_dir/infra/env/.env.dev" ]; then
	set -a
	# shellcheck source=/dev/null
	source "$script_dir/infra/env/.env.dev"
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
