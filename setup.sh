#!/usr/bin/env bash
set -e

echo "================================"
echo "  Vaultify — Setup"
echo "================================"
echo ""

if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Download from https://nodejs.org or install via your package manager."
  exit 1
fi

echo "Node.js $(node -v) found. Installing dependencies..."
npm install

echo ""
echo "================================"
echo "Done! Commands:"
echo ""
echo "  Start in dev mode:"
echo "    npm run electron-dev"
echo ""
echo "  Build installer:"
echo "    npm run dist"
echo "================================"
