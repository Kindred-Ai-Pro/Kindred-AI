#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=env-file.sh
source "${ROOT}/scripts/env-file.sh"

PROD_URL="${CAPACITOR_PRODUCTION_URL:-$(read_env CAPACITOR_PRODUCTION_URL)}"

if [[ -z "${PROD_URL}" ]]; then
  echo "Missing production URL." >&2
  echo "" >&2
  echo "Set your live site URL, e.g.:" >&2
  echo "  CAPACITOR_PRODUCTION_URL=https://kindred-ai.vercel.app npm run cap:ios:prod" >&2
  echo "" >&2
  echo "Or add to .env.local:" >&2
  echo "  CAPACITOR_PRODUCTION_URL=https://your-domain.com" >&2
  exit 1
fi

if [[ "${PROD_URL}" != https://* ]]; then
  echo "Production URL must use HTTPS: ${PROD_URL}" >&2
  exit 1
fi

echo "→ Production URL: ${PROD_URL}"
echo "→ Dev server bypassed — app loads your live site."

upsert_env "CAPACITOR_USE_DEV_SERVER" "false"
upsert_env "CAPACITOR_PRODUCTION_URL" "${PROD_URL}"
remove_env "CAPACITOR_SERVER_URL"
remove_env "NEXT_PUBLIC_ASSET_PREFIX"

export CAPACITOR_USE_DEV_SERVER=false
export CAPACITOR_PRODUCTION_URL="${PROD_URL}"
unset CAPACITOR_SERVER_URL
unset NEXT_PUBLIC_ASSET_PREFIX
export PATH="${HOME}/.local/node-v22.17.0/bin:${HOME}/.local/bin:${PATH}"

cd "${ROOT}"
bash scripts/ensure-node-path.sh cap sync ios
bash scripts/ensure-node-path.sh cap open ios

echo ""
echo "Xcode is opening for PRODUCTION."
echo "  1. Confirm ${PROD_URL} is deployed and working in Safari first"
echo "  2. In Xcode, select your device or simulator"
echo "  3. Product → Archive when ready for App Store"
echo ""
echo "To switch back to local dev: npm run cap:ios:device (phone) or npm run web:dev (browser)"
