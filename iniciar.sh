#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo
echo " Portal Unificado"
echo

if ! command -v node >/dev/null 2>&1; then
  echo " No se encontró Node.js."
  echo " Instala Node desde https://nodejs.org y vuelve a intentar."
  exit 1
fi

node ./scripts/run.mjs install
node ./scripts/run.mjs start
