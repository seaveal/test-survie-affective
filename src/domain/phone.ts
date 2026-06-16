// src/domain/phone.ts
// Normalisation d'un numero de mobile vers E.164 (+33...).
// Miroir exact de `normalize_e164` cote API (tsa_api/models.py) — garder les
// deux fonctions alignees si l'une evolue.

const E164_RE = /^\+[1-9]\d{7,14}$/

/**
 * Normalise un mobile vers le format international E.164 (+33...).
 *
 * Tolerant en entree (espaces, points, tirets, parentheses), strict en sortie.
 * Mappe les numeros nationaux francais (0X...) vers +33. Retourne `null` si
 * l'entree est vide OU si elle ne resout pas a un E.164 valide (on n'invente
 * jamais un indicatif pays).
 */
export function normaliserTelephone(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  let hasPlus = s.startsWith('+')
  let work = s
  if (s.startsWith('00')) {
    work = s.slice(2)
    hasPlus = true
  }
  const digits = work.replace(/\D/g, '')
  if (!digits) return null
  let candidate: string
  if (hasPlus) {
    candidate = '+' + digits
  } else if (digits.startsWith('0') && digits.length === 10) {
    candidate = '+33' + digits.slice(1)
  } else {
    return null
  }
  return E164_RE.test(candidate) ? candidate : null
}
