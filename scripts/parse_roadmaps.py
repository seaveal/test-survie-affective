#!/usr/bin/env python3
"""Parse docs/ROADMAPS_PERSONNALISEES.md and emit src/data/roadmaps.ts."""
import re
from pathlib import Path

DOC = Path(__file__).parent.parent / "docs" / "ROADMAPS_PERSONNALISEES.md"
OUT = Path(__file__).parent.parent / "src" / "data" / "roadmaps.ts"

PROFIL_FROM_TITLE = {
    "MENDIANT": "mendiant",
    "SAUVEUR": "sauveur",
    "CONTRÔLEUR": "controleur",
    "FANTÔME": "fantome",
}
INTENSITE_FROM_TITLE = {
    "SURFACE": "surface",
    "MODÉRÉ": "modere",
    "PROFOND": "profond",
}


def ts_string(s: str) -> str:
    s = s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return f"`{s}`"


def parse_section(title: str, body: str) -> dict:
    m_title = re.match(r"^(\w+)\s*×\s*(\w+)\s*$", title.strip())
    if not m_title:
        # gérer les titres avec accents (CONTRÔLEUR, FANTÔME)
        m_title = re.match(r"^(\S+)\s*×\s*(\S+)\s*$", title.strip())
    profil_label, intensite_label = m_title.group(1), m_title.group(2)
    profil_id = PROFIL_FROM_TITLE[profil_label]
    intensite_id = INTENSITE_FROM_TITLE[intensite_label]

    def extract_block(label: str, until_re: str) -> str:
        m = re.search(
            rf"\*\*{re.escape(label)}\*\*\s*\n+(.*?)(?={until_re}|\Z)",
            body,
            re.DOTALL,
        )
        return m.group(1).strip() if m else ""

    pas_un = extract_block("Pas numéro 1 : Cette semaine", r"\n\*\*")
    pas_deux = extract_block("Pas numéro 2 : Ce mois", r"\n\*\*")
    pas_trois = extract_block("Pas numéro 3 : Dans les 3 mois", r"\n\*\*")
    exercice = extract_block("Exercice corporel prioritaire", r"\n\*\*")
    chap_block = extract_block(
        "Chapitres du livre à relire", r"\n# |\Z"
    ) or extract_block("Chapitres du livre à relire (si lecteur)", r"\n# |\Z")

    chapitres = sorted(set(int(n) for n in re.findall(r"\bChapitre\s+(\d+)", chap_block)))

    return {
        "profilId": profil_id,
        "intensite": intensite_id,
        "pasNumeroUn": pas_un,
        "pasNumeroDeux": pas_deux,
        "pasNumeroTrois": pas_trois,
        "exerciceCorporel": exercice,
        "chapitresLivreCibles": chapitres,
    }


def main() -> None:
    text = DOC.read_text(encoding="utf-8")
    # Headers H1 des roadmaps : "# MENDIANT × SURFACE", etc.
    headers = list(re.finditer(r"^# (.+)$", text, re.MULTILINE))
    roadmaps = []
    for i, h in enumerate(headers):
        title = h.group(1).strip()
        if "×" not in title:
            continue
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        body = text[start:end]
        roadmaps.append(parse_section(title, body))

    assert len(roadmaps) == 12, f"Attendu 12 roadmaps, obtenu {len(roadmaps)}"

    lines = [
        "// Données des 12 roadmaps personnalisées (4 profils × 3 intensités).",
        "// Généré depuis docs/ROADMAPS_PERSONNALISEES.md — ne pas modifier à la main.",
        "// Re-génération via scripts/parse_roadmaps.py.",
        "",
        "import type { Roadmap } from '../domain/types'",
        "",
        "export const roadmaps: Roadmap[] = [",
    ]
    for r in roadmaps:
        lines.append("  {")
        lines.append(f"    profilId: '{r['profilId']}',")
        lines.append(f"    intensite: '{r['intensite']}',")
        lines.append(f"    pasNumeroUn: {ts_string(r['pasNumeroUn'])},")
        lines.append(f"    pasNumeroDeux: {ts_string(r['pasNumeroDeux'])},")
        lines.append(f"    pasNumeroTrois: {ts_string(r['pasNumeroTrois'])},")
        lines.append(f"    exerciceCorporel: {ts_string(r['exerciceCorporel'])},")
        lines.append(
            "    chapitresLivreCibles: ["
            + ", ".join(str(n) for n in r["chapitresLivreCibles"])
            + "],"
        )
        lines.append("  },")
    lines.append("]")
    lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK: {OUT} écrit ({len(roadmaps)} roadmaps)")


if __name__ == "__main__":
    main()
