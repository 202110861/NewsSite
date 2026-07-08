#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Cleaning stale build artifacts..."
rm -rf node_modules dist node_modules_bak 2>/dev/null || sudo rm -rf node_modules dist node_modules_bak

echo "Installing dependencies..."
npm ci

echo "Generating Prisma client..."
npx prisma generate

echo "Building server..."
npm run build

echo "Applying database schema..."
npx prisma db push --skip-generate

echo "Restarting application..."
if pm2 describe newssite-server > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi

pm2 save

echo "Deploy completed."
