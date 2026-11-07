// Logique pure de la page /rdv/ (chantier RDV page maison, 03/11/2026) : fuseaux,
// regroupement des créneaux par jour, URL de repli vers YouCanBookMe, validation.
// Règle des fuseaux (PLAN, « Heures et fuseaux ») : le fuseau de l'appareil, jamais l'IP ;
// affichage créneau par créneau par Intl avec `timeZone` ; jamais getDate() ni toISOString().

/** Page YouCanBookMe de repli quand le serveur ne répond pas (agenda de vente). */
export const PAGE_YCBM = 'https://cyrillenovou-45mn.youcanbook.me/'

export const PARIS = 'Europe/Paris'

// Libellés EXACTS de `QUESTIONS_VENTE` (tsa-api `ycbm_booking.py`, relevé du 03/11/2026) :
// YouCanBookMe garde la valeur choisie telle quelle, apostrophes typographiques comprises.
export const CHOIX_ANCIENNETE = [
  'Moins de 6 mois',
  'Entre 6 mois et 2 ans',
  'Plus de 2 ans',
  'Depuis très longtemps / “toujours”',
] as const

export const CHOIX_PROVENANCE = [
  "le livre « Vous avez tout compris. Rien n'a changé. »",
  'le Test de Survie Affective',
  'un email Régénération',
  'la bio sur les réseaux sociaux',
  'Un réel instagram',
  "Une connaissance m'a parlé de Cyrille",
  'une autre source',
  'je ne sais plus',
] as const

// Anciens noms que certains navigateurs rendent encore (ICU) : la ville affichée est l'actuelle.
// Le serveur ramène de toute façon tout nom au nom canonique avant YouCanBookMe.
const ANCIENS_NOMS: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata', 'Asia/Saigon': 'Asia/Ho_Chi_Minh', 'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon', 'Europe/Kiev': 'Europe/Kyiv', 'Atlantic/Faeroe': 'Atlantic/Faroe',
}

export function canonique(tz: string): string {
  return ANCIENS_NOMS[tz] ?? tz
}

/** Le fuseau réglé sur l'appareil, ou null quand il ne dit rien d'utile (UTC, Etc/…, vide). */
export function fuseauAppareil(): string | null {
  let tz: string | undefined
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return null
  }
  return fuseauUtile(tz) ? canonique(tz!) : null
}

export function fuseauUtile(tz: string | null | undefined): boolean {
  return !!tz && tz !== 'UTC' && !tz.startsWith('Etc/') && fuseauValide(tz)
}

export function fuseauValide(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('fr-FR', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** « heure de Paris », « heure de Toronto »… : la ville du nom IANA. */
export function libelleFuseau(tz: string): string {
  return `heure de ${villeFuseau(tz)}`
}

export function villeFuseau(tz: string): string {
  return (tz.split('/').pop() || tz).replace(/_/g, ' ')
}

const FUSEAUX_REPLI = [
  'Europe/Paris', 'Europe/Brussels', 'Europe/Zurich', 'Europe/Luxembourg', 'Europe/London',
  'Europe/Madrid', 'Europe/Lisbon', 'Europe/Berlin', 'Europe/Rome', 'America/Montreal',
  'America/Toronto', 'America/New_York', 'America/Martinique', 'America/Guadeloupe',
  'America/Cayenne', 'Indian/Reunion', 'Indian/Mayotte', 'Indian/Comoro', 'Indian/Mauritius',
  'Africa/Casablanca', 'Africa/Algiers', 'Africa/Tunis', 'Africa/Dakar', 'Africa/Abidjan',
  'Pacific/Noumea', 'Pacific/Tahiti', 'Asia/Kolkata', 'Asia/Dubai',
]

/** Tous les fuseaux du navigateur, Paris en tête. Repli sur une courte liste sans `supportedValuesOf`. */
export function listeFuseaux(): string[] {
  let tous: string[]
  try {
    const f = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    tous = f ? f('timeZone') : FUSEAUX_REPLI
  } catch {
    tous = FUSEAUX_REPLI
  }
  return [...new Set([PARIS, ...tous.map(canonique).filter(fuseauValide)])]
}

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Recherche par ville (sans accents ni casse), sur le nom IANA entier. */
export function chercherFuseaux(liste: string[], requete: string): string[] {
  const q = sansAccents(requete.trim()).replace(/\s+/g, '_')
  if (!q) return liste
  return liste.filter((t) => sansAccents(t).includes(q))
}

export interface Jour {
  cle: string // AAAA-MM-JJ dans le fuseau choisi
  libelle: string // « jeudi 6 novembre »
  creneaux: { ms: number; heure: string }[]
}

/** Créneaux (epoch ms) regroupés par jour DANS le fuseau choisi, heures écrites créneau par créneau. */
export function grouperParJour(creneaux: number[], tz: string): Jour[] {
  const fCle = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  const fJour = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' })
  const fHeure = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' })
  const jours: Jour[] = []
  for (const ms of [...creneaux].sort((a, b) => a - b)) {
    const d = new Date(ms)
    const cle = fCle.format(d)
    let j = jours[jours.length - 1]
    if (!j || j.cle !== cle) {
      j = { cle, libelle: fJour.format(d), creneaux: [] }
      jours.push(j)
    }
    j.creneaux.push({ ms, heure: fHeure.format(d) })
  }
  return jours
}

/** « jeudi 6 novembre à 18:30 (heure de Paris) ». */
export function creneauEnClair(ms: number, fuseau: string): string {
  const tz = fuseauValide(fuseau) ? fuseau : PARIS
  const d = new Date(ms)
  const jour = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(d)
  const heure = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(d)
  return `${jour} à ${heure} (${libelleFuseau(tz)})`
}

export interface Reponses {
  prenom: string
  situation: string
  anciennete: string
  objectif: string
  nom: string
  email: string
  telephone: string
  sms: boolean
  provenance: string
}

export const REPONSES_VIDES: Reponses = {
  prenom: '', situation: '', anciennete: '', objectif: '', nom: '', email: '', telephone: '',
  sms: false, provenance: '',
}

/** Repli (décision D8) : la page YouCanBookMe pré-remplie de tout ce qui est connu, rien de vide. */
export function urlRepli(page: string, r: Partial<Reponses>, origine: string): string {
  const u = new URL(page || PAGE_YCBM)
  const champs: [string, string | undefined][] = [
    ['FNAME', r.prenom], ['LNAME', r.nom], ['EMAIL', r.email], ['PHONE', r.telephone],
    ['SITUATION', r.situation], ['Q6', r.anciennete], ['OBJECTIF', r.objectif],
    ['PROVENANCE', r.provenance], ['ORIGINE', origine],
  ]
  for (const [k, v] of champs) if (v && v.trim()) u.searchParams.set(k, v.trim())
  return u.toString()
}

export const RE_EMAIL = /^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s.]{2,}$/

/** Erreur du champ, ou '' s'il est valable. Le serveur reste juge (422 par champ). */
export function erreurChamp(champ: keyof Reponses, v: string): string {
  const t = v.trim()
  switch (champ) {
    case 'prenom':
      return t ? '' : 'Votre prénom est nécessaire pour continuer.'
    case 'nom':
      return t ? '' : 'Votre nom est nécessaire pour continuer.'
    case 'situation':
      return t ? '' : 'Quelques mots suffisent, mais cette réponse est nécessaire : c’est ce que Cyrille lit pour vous répondre.'
    case 'anciennete':
      return (CHOIX_ANCIENNETE as readonly string[]).includes(t) ? '' : 'Choisissez une réponse.'
    case 'email':
      return RE_EMAIL.test(t) ? '' : 'Cette adresse e-mail semble incomplète.'
    case 'telephone': {
      const chiffres = t.replace(/\D/g, '')
      return /^\+?[\d\s().-]+$/.test(t) && chiffres.length >= 8 && chiffres.length <= 15
        ? ''
        : 'Ce numéro semble incomplet. Indiquez-le avec l’indicatif s’il n’est pas français (+32, +41, +1…).'
    }
    default:
      return ''
  }
}

/** Identifiant de tentative (`cle`) : un par envoi, gardé jusqu'à la réponse. */
export function nouvelleCle(): string {
  try {
    if (crypto.randomUUID) return crypto.randomUUID()
  } catch {
    // navigateur ancien : repli ci-dessous
  }
  const h = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `${h(8)}-${h(4)}-4${h(3)}-a${h(3)}-${h(12)}`
}
