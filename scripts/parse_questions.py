#!/usr/bin/env python3
"""Parse docs/QUESTIONS_30_SCORING.md and emit src/data/questions.ts."""
import re
import sys
from pathlib import Path

DOC = Path("/Users/cyrille/Documents/projets-dev/test-survie-affective/docs/QUESTIONS_30_SCORING.md")
OUT = Path("/Users/cyrille/Documents/projets-dev/test-survie-affective/src/data/questions.ts")

PROFIL_LETTER_TO_ID = {"M": "mendiant", "S": "sauveur", "C": "controleur", "F": "fantome"}

CHAMP_CIBLE_BY_QID = {27: "statutLivre", 28: "situation", 29: "etatEmotionnel", 30: "pretAAgir"}


def ts_string(s: str) -> str:
    """Encode a string as a TS double-quoted literal (escape \" and \\)."""
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{s}"'


def parse() -> str:
    text = DOC.read_text(encoding="utf-8")
    # Split par "## Question N"
    blocks = re.split(r"\n## Question (\d+)\n", text)
    # blocs[0] = pré-doc, puis [num, contenu, num, contenu, ...]
    questions = []
    for i in range(1, len(blocks), 2):
        qid = int(blocks[i])
        content = blocks[i + 1]
        questions.append((qid, content))

    typage = []
    intensite = []
    contexte = []
    for qid, content in questions:
        # énoncé : entre **Énoncé :** et la prochaine ligne vide
        m = re.search(r"\*\*Énoncé :\*\*\s*(.+?)(?:\n|$)", content)
        if not m:
            print(f"WARN: Q{qid} sans énoncé", file=sys.stderr)
            continue
        enonce = m.group(1).strip()

        if 1 <= qid <= 20:
            # options A/B/C/D avec mapping → **profil-lettre**
            options = []
            for opt_match in re.finditer(
                r"-\s*\*\*([A-D])\*\*\s*:\s*(.+?)\s*→\s*\*\*([MSCF])\*\*",
                content,
            ):
                opt_id, opt_texte, profil_letter = opt_match.groups()
                options.append(
                    {
                        "id": opt_id,
                        "texte": opt_texte.strip(),
                        "profil": PROFIL_LETTER_TO_ID[profil_letter],
                    }
                )
            assert len(options) == 4, f"Q{qid} : {len(options)} options au lieu de 4"
            # Validation : chaque profil exactement 1 fois
            profils_set = {o["profil"] for o in options}
            assert profils_set == {"mendiant", "sauveur", "controleur", "fantome"}, (
                f"Q{qid} : profils {profils_set} (attendu les 4)"
            )
            typage.append({"id": qid, "enonce": enonce, "options": options})

        elif 21 <= qid <= 26:
            # options 1..5
            options = []
            for opt_match in re.finditer(r"-\s*\*\*([1-5])\*\*\s*:\s*(.+?)(?:\n|$)", content):
                v, t = opt_match.groups()
                options.append({"valeur": int(v), "texte": t.strip()})
            assert len(options) == 5, f"Q{qid} : {len(options)} options Likert au lieu de 5"
            intensite.append({"id": qid, "enonce": enonce, "options": options})

        elif 27 <= qid <= 30:
            # options "- texte → `valeur`"
            options = []
            for opt_match in re.finditer(r"-\s+(.+?)\s+→\s+`([^`]+)`", content):
                texte, valeur = opt_match.groups()
                options.append(
                    {
                        "id": chr(ord("A") + len(options)),
                        "texte": texte.strip(),
                        "valeur": valeur.strip(),
                    }
                )
            assert len(options) >= 2, f"Q{qid} : {len(options)} options qualitatives"
            contexte.append(
                {
                    "id": qid,
                    "enonce": enonce,
                    "options": options,
                    "champCible": CHAMP_CIBLE_BY_QID[qid],
                }
            )

    # Génère le TS
    lines = [
        "// Données des 30 questions du test de survie affective.",
        "// Généré depuis docs/QUESTIONS_30_SCORING.md — ne pas modifier à la main.",
        "// Toute mise à jour passe par le doc puis re-génération via /tmp/parse_questions.py.",
        "",
        "import type {",
        "  Question,",
        "  QuestionContexte,",
        "  QuestionIntensite,",
        "  QuestionTypage,",
        "} from '../domain/types'",
        "",
        "export const questionsTypage: QuestionTypage[] = [",
    ]
    for q in typage:
        lines.append("  {")
        lines.append(f"    id: {q['id']},")
        lines.append("    type: 'typage',")
        lines.append(f"    enonce: {ts_string(q['enonce'])},")
        lines.append("    options: [")
        for o in q["options"]:
            lines.append(
                f"      {{ id: {ts_string(o['id'])}, texte: {ts_string(o['texte'])}, profil: '{o['profil']}' }},"
            )
        lines.append("    ],")
        lines.append("  },")
    lines.append("]")
    lines.append("")
    lines.append("export const questionsIntensite: QuestionIntensite[] = [")
    for q in intensite:
        lines.append("  {")
        lines.append(f"    id: {q['id']},")
        lines.append("    type: 'intensite',")
        lines.append(f"    enonce: {ts_string(q['enonce'])},")
        lines.append("    options: [")
        for o in q["options"]:
            lines.append(f"      {{ valeur: {o['valeur']}, texte: {ts_string(o['texte'])} }},")
        lines.append("    ],")
        lines.append("  },")
    lines.append("]")
    lines.append("")
    lines.append("export const questionsContexte: QuestionContexte[] = [")
    for q in contexte:
        lines.append("  {")
        lines.append(f"    id: {q['id']},")
        lines.append("    type: 'contexte',")
        lines.append(f"    enonce: {ts_string(q['enonce'])},")
        lines.append(f"    champCible: '{q['champCible']}',")
        lines.append("    options: [")
        for o in q["options"]:
            lines.append(
                f"      {{ id: {ts_string(o['id'])}, texte: {ts_string(o['texte'])}, valeur: {ts_string(o['valeur'])} }},"
            )
        lines.append("    ],")
        lines.append("  },")
    lines.append("]")
    lines.append("")
    lines.append("export const questions: Question[] = [")
    lines.append("  ...questionsTypage,")
    lines.append("  ...questionsIntensite,")
    lines.append("  ...questionsContexte,")
    lines.append("]")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(parse(), encoding="utf-8")
    print(f"OK: {OUT} écrit")
