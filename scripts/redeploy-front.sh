#!/usr/bin/env bash
# redeploy-front.sh
#
# Re-deploie l'app test-survie-affective sur https://test.souverainauquotidien.com
# A executer sur le VPS apres un push GitHub (manuellement ou via cron/webhook).
#
# Etapes :
#   1. git pull origin main (passer une autre branche en 1er argument)
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
# Defaut : main. La branche `dev` etait le defaut alors que la production vit sur
# main : un lancement sans argument deployait autre chose que la production, et la
# ligne 34 fait `reset --hard` dessus (audit cycle 1, G10).
BRANCH="${1:-main}"

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
# `.env.production` n'est pas versionne (.gitignore) : il vit sur le VPS et porte aussi
# VITE_VSL_KIT_URL, VITE_VSL_KIT_BOUTON_APRES_S et VITE_LIVRE_DISPONIBLE, poses a la main.
# L'ecraser a chaque deploiement effacait la VSL sans un mot (audit cycle 2, rapport 03,
# M2). On garantit la seule ligne dont ce script repond ; les autres ne sont pas touchees.
ENVF="$REPO_DIR/.env.production"
API_LIGNE="VITE_API_URL=https://api.souverainauquotidien.com"
sudo -u agents touch "$ENVF"
if grep -q "^VITE_API_URL=" "$ENVF"; then
  sudo -u agents sed -i "s|^VITE_API_URL=.*|$API_LIGNE|" "$ENVF"
else
  printf '%s\n' "$API_LIGNE" | sudo -u agents tee -a "$ENVF" >/dev/null
fi
echo "    variables de build : $(sudo -u agents sed -n 's/^\([A-Z_]*\)=.*/\1/p' "$ENVF" | tr '\n' ' ')"
sudo -u agents npm run build

echo "==> 5/5 : rsync dist/ -> $DIST_DIR"
mkdir -p "$DIST_DIR"
rsync -a --delete "$REPO_DIR/dist/" "$DIST_DIR/"
chown -R caddy:caddy /opt/test-sq-front

echo ""
echo "==> Redeploiement OK."
echo "Test : curl -sI https://test.souverainauquotidien.com/"
