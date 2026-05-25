/**
 * CI anti-désync : vérifie que les 3 cibles TS committées (profils.ts,
 * roadmaps.ts, questions.ts) sont strictement identiques aux cibles
 * régénérées depuis le canonical JSON via emit_front.py.
 *
 * Si ce test échoue, c'est que :
 *   - quelqu'un a édité une cible TS à la main (interdit — ces fichiers sont générés),
 *   - OU les Markdown vault ont été modifiés sans run du pipeline.
 *
 * Fix : ré-exécuter le pipeline + re-commit
 *   bash /home/agents/vault/99-Meta/test-survie-affective/tools/build-all.sh
 *   git add src/data/*.ts && git commit -m "chore(canonical): regen front TS"
 *
 * Ajouté dans le cadre de la mission `MISSION_2026-05-25_centralisation-contenu-tsa.md`
 * (ADR `2026-05-25_centralisation-contenu-tsa-source-canonique.md`).
 */
import { describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const VAULT_TOOLS = '/home/agents/vault/99-Meta/test-survie-affective/tools'
const EMIT_FRONT = join(VAULT_TOOLS, 'emit_front.py')
const LINT_VOIX = join(VAULT_TOOLS, 'lint_voix.py')
const SRC_DATA = join(__dirname)

const hasVaultTools = existsSync(EMIT_FRONT) && existsSync(LINT_VOIX)

describe.skipIf(!hasVaultTools)('canonical sync (anti-désync front TS)', () => {
  it('lint voix H3C est conforme sur les MDs vault', () => {
    // Lance lint_voix.py et vérifie exit 0
    let exitCode = 0
    try {
      execSync(`python3 ${LINT_VOIX}`, { stdio: 'pipe' })
    } catch (e: any) {
      exitCode = e.status ?? 1
      const stdout = e.stdout?.toString() ?? ''
      throw new Error(`Lint voix H3C échoué (exit ${exitCode}):\n${stdout}`)
    }
    expect(exitCode).toBe(0)
  })

  it.each(['profils.ts', 'roadmaps.ts', 'questions.ts'])(
    'regenerated %s matches committed (byte-identical)',
    (filename) => {
      const tmp = mkdtempSync(join(tmpdir(), 'canonical-resync-'))
      execSync(`python3 ${EMIT_FRONT} --out-dir ${tmp}`, { stdio: 'pipe' })
      const regenerated = readFileSync(join(tmp, filename), 'utf-8')
      const committed = readFileSync(join(SRC_DATA, filename), 'utf-8')
      expect(
        regenerated,
        `DÉSYNC : src/data/${filename} committé ≠ regenere depuis canonical.\n` +
          `Cause probable : édition manuelle ${filename}, OU modif MD vault sans pipeline.\n` +
          `Fix : bash ${VAULT_TOOLS}/build-all.sh && git add src/data/*.ts && git commit`,
      ).toEqual(committed)
    },
  )
})
