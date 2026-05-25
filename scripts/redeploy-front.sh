#!/usr/bin/env bash
# redeploy-front.sh
#
# Re-deploie l'app test-survie-affective sur https://test.souverainauquotidien.com
# A executer sur le VPS apres un push GitHub (manuellement ou via cron/webhook).
#
# Etapes :
#   1. git pull origin dev (ou main selon branche cible)
#   2. npm install si package-lock change
#   3. npm run test:run (refuse de deployer si rouge)
#   4. npm run build
#   5. rsync dist/ vers /opt/test-sq-front/dist/ avec ownership caddy
#
# Usage (sudo) :
#   sudo bash /home/agents/code/test-survie-affective/scripts/redeploy-front.sh
#

set -euo pipefail

REPO_DIR="/home/agents/code/test-survie-affective"
DIST_DIR="/opt/test-sq-front/dist"
BRANCH="${1:-dev}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERREUR : doit etre execute en sudo ou root." >&2
  exit 1
fi

cd "$REPO_DIR"

echo "==> 1/5 : git fetch + reset sur origin/$BRANCH"
sudo -u agents git fetch origin
sudo -u agents git checkout "$BRANCH"
sudo -u agents git reset --hard "origin/$BRANCH"

echo "==> 2/5 : npm install (si package-lock change)"
sudo -u agents npm ci --silent 2>/dev/null || sudo -u agents npm install --silent

echo "==> 3/5 : npm run test:run (deploiement ANNULE si rouge)"
sudo -u agents npm run test:run

echo "==> 4/5 : npm run build (production)"
echo "VITE_API_URL=https://api.souverainauquotidien.com" | sudo -u agents tee "$REPO_DIR/.env.production" >/dev/null
sudo -u agents npm run build

echo "==> 5/5 : rsync dist/ -> $DIST_DIR"
mkdir -p "$DIST_DIR"
rsync -a --delete "$REPO_DIR/dist/" "$DIST_DIR/"
chown -R caddy:caddy /opt/test-sq-front

echo ""
echo "==> Redeploiement OK."
echo "Test : curl -sI https://test.souverainauquotidien.com/"
