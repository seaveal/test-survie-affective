#!/usr/bin/env bash
# Garde par DENSITÉ d'adresses de personnes réelles — appelé depuis pre-commit.
# Posé le 2026-08-10 (audit tour 12, constat RECUR-T12-03), corrigé le même jour
# au tour 13 sur deux défauts de mon propre correctif.
#
# POURQUOI PAR DENSITÉ, ET NON PAR NOM DE FICHIER
# Le .gitignore protège par NOM. Cinq fois en deux mois un fichier lui a échappé par
# un suffixe imprévu, et deux de ces cinq fois c'est un script de correction d'audit
# qui l'a poussé. Le 2026-08-10, l'arbre du vault portait 329 fichiers contenant des
# adresses de personnes réelles, dont 311 en .md : aucun motif de nom ne les
# attrapera jamais. Seule la densité distingue un export de 673 anamnèses d'une note
# qui cite un client.
#
# POURQUOI IL NE BLOQUE JAMAIS — la propriété la plus importante de ce fichier
# Le robot de commit pousse le vault toutes les cinq minutes, sans personne devant.
# Un crochet qui sort en non-zéro l'arrête, et le vault cesse d'être sauvegardé sans
# que quiconque l'apprenne : 25 minutes le 2026-08-04, puis 7 h 34 le 2026-08-06
# (SILENCE-T11-01, 90 échecs consécutifs, ~115 fichiers non sauvegardés). Ce garde
# DÉSINDEXE le fichier fautif et laisse le reste du commit passer. Il sort toujours
# en 0, y compris si son propre code casse.
#
# DEUX DÉFAUTS DE LA PREMIÈRE VERSION, CORRIGÉS AU TOUR 13 LE MÊME JOUR
#  1. Elle était installée dans .git/hooks/pré-commit. Les deux dépôts portent
#     core.hooksPath = .git-hooks : Git ne l'a JAMAIS appelée. Le banc qui l'avait
#     « prouvée » tournait dans un dépôt jetable où hooksPath n'était pas défini —
#     piège n°1 du prompt canonique, appliqué à une correction d'audit.
#  2. Elle ne couvrait qu'un dépôt sur neuf, et ignorait les domaines de marque.
#
# SEUIL — mesuré, pas rond
# Distribution du 2026-08-10 sur l'arbre du vault : 631 (l'export YouCanBookMe),
# puis 30 (l'index des mails, artefact généré légitime), 19, 18, 16, 15… Le seuil
# est posé à 50, dans le trou de vingt fois qui sépare l'offenseur du premier
# fichier normal. Zéro faux positif sur les deux dépôts au moment de la pose.

set +e

SEUIL=50
# Domaines grand public : une adresse professionnelle isolée dans une note n'est pas
# le sujet — ce qu'on cherche, c'est un lot de personnes physiques. Les domaines de
# marque sont ajoutés au tour 13 : un export de nos propres contacts est un export.
DOMAINES='(gmail|hotmail|outlook|yahoo|free|orange|wanadoo|sfr|laposte|icloud|live|msn|gmx|protonmail|bbox|numericable|aol)\.[a-z.]{2,6}|[a-z0-9._%+-]+@(h3c\.fr|h3c\.life|cyrillenovou\.com|souverainauquotidien\.com|novou\.com)'
INBOX_DG="/home/agents/vault/99-Meta/Communications/DG/Inbox"

racine=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$racine" 2>/dev/null || exit 0
LOG="$racine/.git/densite-adresses.log"

desindexes=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  grep -Iq . "$f" 2>/dev/null || continue          # binaire : on ne compte pas
  n=$(grep -ohiE "[a-z0-9._%+-]+@${DOMAINES}" "$f" 2>/dev/null | sort -u | wc -l)
  [ -z "$n" ] && continue
  if [ "$n" -ge "$SEUIL" ] 2>/dev/null; then
    git restore --staged -- "$f" 2>/dev/null || git reset -q HEAD -- "$f" 2>/dev/null
    desindexes="${desindexes}${racine}/${f} (${n} adresses distinctes)\n"
    printf '%s\tDESINDEXE\t%s\t%s adresses distinctes\n' "$(date -Is)" "$f" "$n" >> "$LOG" 2>/dev/null
  fi
done < <(git diff --cached --name-only --diff-filter=AM 2>/dev/null)

[ -z "$desindexes" ] && exit 0

printf '\n⚠️  Garde de densité (RECUR-T12-03) — fichier(s) DÉSINDEXÉ(S), le commit continue :\n' >&2
printf "%b" "$desindexes" >&2
printf 'Ils restent sur le disque, hors du suivi Git. Leur CONSERVATION reste à trancher\n' >&2
printf '(RGPD art. 5.1.e) : suppression, ou conservation justifiée hors dépôt.\n' >&2
printf 'Journal : %s\n\n' "$LOG" >&2

# L'alerte doit avoir un lecteur, sinon c'est la récurrence n°3. L'Inbox du DG est
# surveillée par dg-inbox-watcher, qui notifie sur Telegram. Une note par jour au
# plus : un garde bavard finit par ne plus être lu.
#
# L'ALLOWLIST DE DÉPÔTS N'EST PAS UNE PRÉCAUTION, C'EST UNE RÉPARATION.
# Première version : la note partait dès que l'Inbox existait sur le disque. Comme
# le chemin est ABSOLU, un dépôt de test jetable sous /tmp a déclenché une vraie
# alerte dans le vault le 2026-08-10 à 10h25, et le veilleur l'a notifiée — l'audit
# a fabriqué l'incident qu'il mesurait. Une alerte n'est légitime que si elle vient
# d'un dépôt réel : la liste est courte, explicite, et ses exclus sont nommés (tout
# autre dépôt, y compris les bancs).
cas_reel=0
# Etendue aux NEUF depots officiels le 2026-08-30 (constats RECUR-T14-02 + SOCLE-T1-02).
# La liste ne portait que trois depots parce que le garde n etait pose que sur trois.
# L etendre en meme temps que le garde est OBLIGATOIRE : un garde pose sans son
# lecteur desindexe en silence, et c est la recurrence n 3 (une alerte sans lecteur)
# doublee de la n 7 (un filet bati sur une liste a l angle mort de ce qu elle omet).
# Les exclus restent nommes : tout autre depot, y compris les bancs jetables — c est
# ce qui a evite qu un depot de test sous /tmp fabrique une vraie alerte, le 2026-08-10.
case "$racine" in
  /home/agents/vault|/home/agents/agents-workers|/home/agents/code/test-survie-affective-api) cas_reel=1 ;;
  /home/agents/code/test-survie-affective|/home/agents/content-agent|/home/agents/code/reels-engine) cas_reel=1 ;;
  /home/agents/code/ads-studio|/home/agents/code/h3c-core|/home/agents/code/neuro-coaching-feed) cas_reel=1 ;;
esac

jour=$(date +%Y-%m-%d)
note="${INBOX_DG}/${jour}_garde-densite-adresses.md"
if [ "$cas_reel" -eq 1 ] && [ -d "$INBOX_DG" ] && [ ! -f "$note" ]; then
  {
    printf -- '---\n'
    printf 'title: "Garde de densité — fichier de données personnelles désindexé"\n'
    printf 'type: alerte-technique\nentity: GROUPE\ncreated: %s\nstatus: nouveau\n' "$jour"
    printf 'from: pre-commit\npriority: P2\ntags: [rgpd, pre-commit, RECUR-T12-03]\n'
    printf -- '---\n\n'
    printf 'Le crochet pre-commit a retiré du commit un ou plusieurs fichiers portant au\n'
    printf 'moins %s adresses distinctes de personnes physiques.\n\n' "$SEUIL"
    printf "%b" "$desindexes"
    printf '\nLe commit a continué sans eux — la sauvegarde n a pas été interrompue. Les\n'
    printf 'fichiers sont toujours sur le disque, simplement hors du suivi Git.\n\n'
    printf 'Ce qui reste à trancher : leur **conservation**, pas leur emplacement.\n'
    printf 'RGPD art. 5.1.e — suppression pure, ou conservation justifiée et datée hors dépôt.\n\n'
    printf 'Journal : `%s`\n' "$LOG"
  } > "$note" 2>/dev/null
  # La note n'est ajoutée à l'index que si elle appartient au dépôt courant.
  case "$note" in "$racine"/*) git add -- "$note" 2>/dev/null ;; esac
fi

exit 0
