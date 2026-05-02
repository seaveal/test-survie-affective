#!/usr/bin/env python3
"""Parse docs/PROFILS_RESULTATS_TEXTES.md and emit src/data/profils.ts."""
import re
from pathlib import Path

DOC = Path(__file__).parent.parent / "docs" / "PROFILS_RESULTATS_TEXTES.md"
OUT = Path(__file__).parent.parent / "src" / "data" / "profils.ts"

PROFIL_ID_BY_NAME = {
    "MENDIANT DE LUXE": "mendiant",
    "SAUVEUR ÉPUISÉ": "sauveur",
    "CONTRÔLEUR ANXIEUX": "controleur",
    "FANTÔME RELATIONNEL": "fantome",
}


def ts_string(s: str) -> str:
    s = s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return f"`{s}`"


def parse_profil_block(block: str, profil_name: str) -> dict:
    profil_id = PROFIL_ID_BY_NAME[profil_name]
    nom = profil_name.split(" ", 1)[1].capitalize() + (
        " " + profil_name.split(" ", 1)[0].lower() if profil_name.startswith("LE ") or profil_name.startswith("LA ") else ""
    )
    # Pour le naming, on utilise simplement le titre tel qu'apparu (sans LE/LA)
    nom_display = profil_name.replace("LE ", "Le ").replace("LA ", "La ")

    # icone : "**Icône** : <texte>"
    m_ico = re.search(r"\*\*Icône\*\*\s*:\s*(.+)", block)
    icone = m_ico.group(1).strip() if m_ico else ""

    # ambassadeur (ou ambassadrice)
    m_amb = re.search(r"\*\*Ambassad(?:eur|rice)\*\*\s*:\s*(.+)", block)
    ambassadeur = m_amb.group(1).strip() if m_amb else ""

    # description de base : tout entre "## Description de base" et "## Les 7 symptômes"
    m_desc = re.search(
        r"## Description de base[^\n]*\n+(.*?)(?=\n## Les 7 symptômes)",
        block,
        re.DOTALL,
    )
    desc_raw = m_desc.group(1).strip() if m_desc else ""
    description_base = desc_raw

    # 7 symptômes : sous "## Les 7 symptômes"
    m_sym = re.search(
        r"## Les 7 symptômes[^\n]*\n+(.*?)(?=\n## Modulateurs)",
        block,
        re.DOTALL,
    )
    sept_symptomes = []
    if m_sym:
        sym_text = m_sym.group(1)
        for sm in re.finditer(r"^\d+\.\s+(.+?)(?=\n\d+\.|\n## |\Z)", sym_text, re.DOTALL | re.MULTILINE):
            symptome = sm.group(1).strip().replace("\n", " ")
            symptome = re.sub(r"\s+", " ", symptome)
            sept_symptomes.append(symptome)

    # Modulateurs : 3 sections SURFACE / MODÉRÉE / PROFONDE
    modulateurs = {"surface": "", "modere": "", "profond": ""}
    for niv_label, niv_key in [
        ("SURFACE", "surface"),
        ("MODÉRÉE", "modere"),
        ("PROFONDE", "profond"),
    ]:
        m = re.search(
            rf"### Intensité {niv_label}\s*\n+(.*?)(?=\n### Intensité|\n---|\Z)",
            block,
            re.DOTALL,
        )
        if m:
            modulateurs[niv_key] = m.group(1).strip()

    return {
        "id": profil_id,
        "nom": nom_display,
        "icone": icone,
        "ambassadeur": ambassadeur,
        "descriptionBase": description_base,
        "septSymptomes": sept_symptomes,
        "modulateursIntensite": modulateurs,
    }


def parse_cta(text: str) -> dict:
    """Extrait les 3 blocs CTA selon statutLivre (pas_lu / lu_partiel / lu_complet)."""
    out = {}
    for statut, label in [("pas_lu", "pas_lu"), ("lu_partiel", "lu_partiel"), ("lu_complet", "lu_complet")]:
        m = re.search(
            rf"## Si statutLivre = `{label}`\s*\n+(.*?)(?=\n## Si statutLivre|\n---|\Z)",
            text,
            re.DOTALL,
        )
        if not m:
            continue
        block = m.group(1)
        # amorce = bloc entre "**Bloc d'amorce livre**" (ou "**Bloc d'amorce**") et "**CTA principal**"
        m_am = re.search(
            r"\*\*Bloc d'amorce(?:[^*]*)\*\*\s*(?:\([^)]*\))?\s*:\s*\n+(.*?)(?=\n\*\*CTA principal)",
            block,
            re.DOTALL,
        )
        amorce = ""
        if m_am:
            # cleanup blockquotes ">"
            amorce = "\n".join(
                line.lstrip("> ").rstrip()
                for line in m_am.group(1).strip().splitlines()
            ).strip()
        # CTA principal
        m_p = re.search(
            r"\*\*CTA principal\*\*\s*:\s*\n-\s*Texte\s*:\s*(.+)\n-\s*URL\s*:\s*(\S+)",
            block,
        )
        principal = (
            {"texte": m_p.group(1).strip(), "url": m_p.group(2).strip()} if m_p else None
        )
        m_s = re.search(
            r"\*\*CTA secondaire\*\*\s*:\s*\n-\s*Texte\s*:\s*(.+)\n-\s*URL\s*:\s*(\S+)",
            block,
        )
        secondaire = (
            {"texte": m_s.group(1).strip(), "url": m_s.group(2).strip()} if m_s else None
        )
        out[statut] = {
            "amorce": amorce,
            "ctaPrincipal": principal,
            "ctaSecondaire": secondaire,
        }
    return out


def main() -> None:
    text = DOC.read_text(encoding="utf-8")
    # Découpage par "# PROFIL N : LE/LA <NOM>"
    blocks = re.split(r"\n# PROFIL \d+\s*:\s*LE?A?\s+", text)
    profils = []
    for b in blocks[1:]:  # le premier élément est le pré-doc
        # 1ère ligne = nom
        first_line, rest = b.split("\n", 1)
        nom = first_line.strip()
        if nom not in PROFIL_ID_BY_NAME:
            continue
        profils.append(parse_profil_block(rest, nom))

    # CTA section
    cta = parse_cta(text)

    # Génération TS
    lines = [
        "// Données des 4 profils + textes par intensité.",
        "// Généré depuis docs/PROFILS_RESULTATS_TEXTES.md — ne pas modifier à la main.",
        "// Re-génération via scripts/parse_profils.py.",
        "",
        "import type { CtaParStatut, Profil, StatutLivre } from '../domain/types'",
        "",
        "export const profils: Profil[] = [",
    ]
    for p in profils:
        lines.append("  {")
        lines.append(f"    id: '{p['id']}',")
        lines.append(f"    nom: {ts_string(p['nom'])},")
        lines.append(f"    icone: {ts_string(p['icone'])},")
        lines.append(f"    ambassadeur: {ts_string(p['ambassadeur'])},")
        lines.append(f"    descriptionBase: {ts_string(p['descriptionBase'])},")
        lines.append("    septSymptomes: [")
        for s in p["septSymptomes"]:
            lines.append(f"      {ts_string(s)},")
        lines.append("    ],")
        lines.append("    modulateursIntensite: {")
        for k in ("surface", "modere", "profond"):
            lines.append(f"      {k}: {ts_string(p['modulateursIntensite'][k])},")
        lines.append("    },")
        lines.append("  },")
    lines.append("]")
    lines.append("")
    lines.append("export const ctaParStatut: Record<StatutLivre, CtaParStatut> = {")
    for statut in ("pas_lu", "lu_partiel", "lu_complet"):
        c = cta.get(statut)
        if not c:
            continue
        lines.append(f"  {statut}: {{")
        lines.append(f"    amorce: {ts_string(c['amorce'])},")
        if c["ctaPrincipal"]:
            lines.append(
                f"    ctaPrincipal: {{ texte: {ts_string(c['ctaPrincipal']['texte'])}, url: {ts_string(c['ctaPrincipal']['url'])} }},"
            )
        if c["ctaSecondaire"]:
            lines.append(
                f"    ctaSecondaire: {{ texte: {ts_string(c['ctaSecondaire']['texte'])}, url: {ts_string(c['ctaSecondaire']['url'])} }},"
            )
        lines.append("  },")
    lines.append("}")
    lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK: {OUT} écrit ({len(profils)} profils, {len(cta)} statuts CTA)")


if __name__ == "__main__":
    main()
