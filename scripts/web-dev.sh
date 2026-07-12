#!/usr/bin/env bash
set -euo pipefail

# Reset .env.local for normal browser development on localhost.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=env-file.sh
source "${ROOT}/scripts/env-file.sh"

echo "→ Resetting for local browser dev (localhost:3000)"

remove_env "NEXT_PUBLIC_ASSET_PREFIX"
remove_env "CAPACITOR_SERVER_URL"
remove_env "CAPACITOR_USE_DEV_SERVER"
remove_env "CAPACITOR_PRODUCTION_URL"

echo "→ Removed Capacitor dev/production overrides from .env.local"
echo "→ Restart the dev server: npm run dev"
echo "→ Open http://localhost:3000"
