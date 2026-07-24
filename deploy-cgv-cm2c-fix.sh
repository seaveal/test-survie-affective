#!/usr/bin/env bash
# LEG-01 — Déploiement du fix médiateur CNPM → CM2C sur la CGV TSA live.
# À lancer par Cyrille :  sudo bash /home/agents/code/test-survie-affective/deploy-cgv-cm2c-fix.sh
# Idempotent, vérifié, avec backup. Caddy sert le statique → aucun restart de service.
set -euo pipefail

SRC=/home/agents/code/test-survie-affective/public/cgv/index.html
DST=/opt/test-sq-front/dist/cgv/index.html
STAMP=$(date +%Y%m%d-%H%M%S)

echo "== 1. Vérif source (doit contenir CM2C, pas CNPM) =="
grep -q "CM2C" "$SRC" || { echo "❌ Source sans CM2C — abort"; exit 1; }
grep -q "CNPM" "$SRC" && { echo "❌ Source contient encore CNPM — abort"; exit 1; }
echo "   OK : $SRC"

echo "== 2. Backup du fichier live =="
cp -a "$DST" "${DST}.bak-cnpm-${STAMP}"
echo "   → ${DST}.bak-cnpm-${STAMP}"

echo "== 3. Déploiement (ownership caddy:caddy, 644) =="
install -o caddy -g caddy -m 644 "$SRC" "$DST"

echo "== 4. Vérif live =="
if grep -q "CM2C" "$DST" && ! grep -q "CNPM" "$DST"; then
  echo "   ✅ CGV live = CM2C, CNPM absent."
else
  echo "   ❌ Vérif échouée — restaurer via ${DST}.bak-cnpm-${STAMP}"; exit 1
fi
echo "== Terminé. Caddy sert le fichier statique directement, aucun restart nécessaire. =="
