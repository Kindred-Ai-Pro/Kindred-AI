#!/usr/bin/env bash
# Shared helpers for reading/writing .env.local (sourced by other scripts).

ENV_FILE="${ROOT}/.env.local"

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

read_env() {
  local key="$1"
  if [[ -f "${ENV_FILE}" ]]; then
    grep "^${key}=" "${ENV_FILE}" 2>/dev/null | head -1 | cut -d= -f2-
  fi
}
