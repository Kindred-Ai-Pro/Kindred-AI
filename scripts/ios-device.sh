#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

IP="${CAPACITOR_DEV_IP:-$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)}"

if [[ -z "${IP}" ]]; then
  echo "Could not detect your Mac's IP address." >&2
  echo "Connect to Wi-Fi, or run: CAPACITOR_DEV_IP=192.168.x.x bash scripts/ios-device.sh" >&2
  exit 1
fi

DEV_URL="http://${IP}:3000"
echo "→ Dev server URL: ${DEV_URL}"
echo "→ Make sure 'npm run dev' is running on your Mac before launching the app."

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

upsert_env "CAPACITOR_SERVER_URL" "${DEV_URL}"
remove_env "NEXT_PUBLIC_ASSET_PREFIX"

export CAPACITOR_SERVER_URL="${DEV_URL}"
unset NEXT_PUBLIC_ASSET_PREFIX
export PATH="${HOME}/.local/node-v22.17.0/bin:${HOME}/.local/bin:${PATH}"

cd "${ROOT}"
bash scripts/ensure-node-path.sh cap sync ios
bash scripts/ensure-node-path.sh cap open ios

echo ""
echo "Xcode is opening. Next steps:"
echo "  1. Restart 'npm run dev' if it is already running"
echo "  2. Connect your iPhone via USB (same Wi-Fi as this Mac)"
echo "  3. In Xcode, select your iPhone as the run target"
echo "  4. Click Run (▶) — sign with your Apple ID if prompted"
echo "  5. On iPhone: Settings → General → VPN & Device Management → Trust"
