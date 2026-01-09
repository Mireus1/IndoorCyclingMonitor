#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pids=()

cleanup() {
  for pid in "${pids[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup INT TERM EXIT

(
  cd "$ROOT_DIR/back"
  pipenv run uvicorn api:app --host 127.0.0.1 --port 8000 --reload
) &
pids+=($!)

(
  cd "$ROOT_DIR/front"
  npm run dev -- --host --port 5173 --strictPort
) &
pids+=($!)

wait "${pids[@]}"
