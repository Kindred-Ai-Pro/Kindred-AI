#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="${HOME}/.local/node-v22.17.0/bin"

if [[ ! -x "${NODE_BIN}/node" ]]; then
  echo "Node.js not found at ${NODE_BIN}/node" >&2
  echo "Install Node 22 to ~/.local/node-v22.17.0 or update scripts/ensure-node-path.sh" >&2
  exit 1
fi

export PATH="${NODE_BIN}:${ROOT}/node_modules/.bin:${PATH}"
cd "${ROOT}"
exec "$@"
