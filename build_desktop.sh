#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[build] Cleaning old artifacts..."
rm -rf \
  "$ROOT_DIR/front/dist" \
  "$ROOT_DIR/front/dist-electron" \
  "$ROOT_DIR/back/dist" \
  "$ROOT_DIR/back/build"

echo "[build] Building frontend..."
(
  cd "$ROOT_DIR/front"
  npm run build
)

echo "[build] Building backend..."
(
  cd "$ROOT_DIR/front"
  npm run build:backend
)

echo "[build] Packaging Electron app..."
(
  cd "$ROOT_DIR/front"
  npx electron-builder
)

echo "[build] Done."
