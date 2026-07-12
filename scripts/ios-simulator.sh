#!/usr/bin/env bash
set -euo pipefail

# iOS Simulator shares the Mac's loopback — use 127.0.0.1, not your LAN IP.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"
DEV_URL="http://127.0.0.1:3000"

echo "→ Simulator dev server URL: ${DEV_URL}"
echo "→ Asset prefix disabled (same origin — required for simulator)"
echo "→ Restart 'npm run dev' after this script if it is already running."

upsert_env() {
  local key="$1"
  local value="$2"
  if [[ -f "${ENV_FILE}" ]] && grep -q "^${key}=" "${ENV_FILE}"; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    fi
  else
    echo "${key}=${value}" >> "${ENV_FILE}"
  fi
}

remove_env() {
  local key="$1"
  if [[ -f "${ENV_FILE}" ]] && grep -q "^${key}=" "${ENV_FILE}"; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "/^${key}=/d" "${ENV_FILE}"
    else
      sed -i "/^${key}=/d" "${ENV_FILE}"
    fi
  fi
}

upsert_env "CAPACITOR_SERVER_URL" "${DEV_URL}"
remove_env "NEXT_PUBLIC_ASSET_PREFIX"

export CAPACITOR_SERVER_URL="${DEV_URL}"
unset NEXT_PUBLIC_ASSET_PREFIX
export PATH="${HOME}/.local/node-v22.17.0/bin:${HOME}/.local/bin:${PATH}"

cd "${ROOT}"
bash scripts/ensure-node-path.sh cap sync ios
bash scripts/ensure-node-path.sh cap open ios

echo ""
echo "Xcode is opening for Simulator."
echo "  1. Restart: npm run dev"
echo "  2. Pick an iPhone Simulator (not a physical device)"
echo "  3. Click Run (▶)"
echo ""
echo "For a physical iPhone, use: npm run cap:ios:device"
