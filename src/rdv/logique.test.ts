import { describe, expect, it } from 'vitest'
import {
  CHOIX_ANCIENNETE, canonique, chercherFuseaux, creneauEnClair, erreurChamp, fuseauUtile, grouperParJour,
  libelleFuseau, listeFuseaux, urlRepli,
} from './logique'

const ms = (iso: string) => Date.parse(iso)

describe('fuseaux', () => {
  it('écarte UTC, Etc/… et le vide, garde un fuseau réel', () => {
    expect(fuseauUtile('UTC')).toBe(false)
    expect(fuseauUtile('Etc/Unknown')).toBe(false)
    expect(fuseauUtile('Etc/GMT+5')).toBe(false)
    expect(fuseauUtile('')).toBe(false)
    expect(fuseauUtile(undefined)).toBe(false)
    expect(fuseauUtile('Pas/UnFuseau')).toBe(false)
    expect(fuseauUtile('America/Toronto')).toBe(true)
  })

  it('ramène les anciens noms au nom actuel, sans doublon', () => {
    expect(canonique('Asia/Calcutta')).toBe('Asia/Kolkata')
    expect(canonique('Europe/Paris')).toBe('Europe/Paris')
    const l = listeFuseaux()
    expect(new Set(l).size).toBe(l.length)
  })

  it('un fuseau illisible ne casse pas la confirmation : heure de Paris', () => {
    expect(creneauEnClair(ms('2026-11-06T17:30:00Z'), '')).toBe('vendredi 6 novembre à 18:30 (heure de Paris)')
  })

  it('écrit la ville du fuseau', () => {
    expect(libelleFuseau('Europe/Paris')).toBe('heure de Paris')
    expect(libelleFuseau('America/New_York')).toBe('heure de New York')
  })

  it('met Paris en tête et cherche par ville sans accents', () => {
    const l = listeFuseaux()
    expect(l[0]).toBe('Europe/Paris')
    expect(l.filter((t) => t === 'Europe/Paris')).toHaveLength(1)
    expect(chercherFuseaux(l, 'toronto')).toContain('America/Toronto')
    expect(chercherFuseaux(['Indian/Reunion', 'Europe/Paris'], 'Réunion')).toEqual(['Indian/Reunion'])
    expect(chercherFuseaux(['America/New_York'], 'new york')).toEqual(['America/New_York'])
  })
})

describe('regroupement par jour, dans le fuseau choisi', () => {
  // 30/10/2026 (entre le changement d'heure européen du 25/10 et le nord-américain du 01/11) :
  // Paris en UTC+1, Toronto en UTC−4 → 5 h d'écart, et non 6.
  const creneaux = [ms('2026-10-30T17:30:00Z'), ms('2026-10-30T23:30:00Z'), ms('2026-10-30T09:00:00Z')]

  it('Paris : 10:00 et 18:30 le 30, 00:30 le 31', () => {
    const j = grouperParJour(creneaux, 'Europe/Paris')
    expect(j.map((x) => x.cle)).toEqual(['2026-10-30', '2026-10-31'])
    expect(j[0].creneaux.map((c) => c.heure)).toEqual(['10:00', '18:30'])
    expect(j[1].creneaux.map((c) => c.heure)).toEqual(['00:30'])
  })

  it('Toronto pendant la fenêtre du 25/10 au 01/11 : 5 h d\'écart', () => {
    const j = grouperParJour(creneaux, 'America/Toronto')
    expect(j.map((x) => x.cle)).toEqual(['2026-10-30'])
    expect(j[0].creneaux.map((c) => c.heure)).toEqual(['05:00', '13:30', '19:30'])
  })

  it('Toronto après le 01/11 : 6 h d\'écart', () => {
    const j = grouperParJour([ms('2026-11-06T17:30:00Z')], 'America/Toronto')
    expect(j[0].creneaux[0].heure).toBe('12:30')
  })

  it('Kolkata (UTC+5:30) change de jour', () => {
    const j = grouperParJour([ms('2026-11-06T19:00:00Z')], 'Asia/Kolkata')
    expect(j[0].cle).toBe('2026-11-07')
    expect(j[0].creneaux[0].heure).toBe('00:30')
  })

  it('heure par créneau autour du changement d\'heure européen du 28/03/2027', () => {
    const j = grouperParJour([ms('2027-03-27T09:00:00Z'), ms('2027-03-29T09:00:00Z')], 'Europe/Paris')
    expect(j.map((x) => x.creneaux[0].heure)).toEqual(['10:00', '11:00'])
  })

  it('créneau en clair, avec le fuseau écrit', () => {
    expect(creneauEnClair(ms('2026-11-06T17:30:00Z'), 'Europe/Paris')).toBe('vendredi 6 novembre à 18:30 (heure de Paris)')
  })
})

describe('repli vers YouCanBookMe', () => {
  it('pré-remplit tout ce qui est connu et rien de vide', () => {
    const u = new URL(urlRepli('https://cyrillenovou-30mn.youcanbook.me/', {
      prenom: 'Jane', nom: 'Doe', email: 'jane@example.com', telephone: '+33 6 12 34 56 78',
      situation: 'Ma situation', anciennete: CHOIX_ANCIENNETE[3], objectif: '', provenance: '',
    }, 'zRH7M'))
    expect(u.origin).toBe('https://cyrillenovou-30mn.youcanbook.me')
    expect(u.searchParams.get('FNAME')).toBe('Jane')
    expect(u.searchParams.get('Q6')).toBe('Depuis très longtemps / “toujours”')
    expect(u.searchParams.get('PHONE')).toBe('+33 6 12 34 56 78')
    expect(u.searchParams.get('ORIGINE')).toBe('zRH7M')
    expect(u.searchParams.has('OBJECTIF')).toBe(false)
    expect(u.searchParams.has('PROVENANCE')).toBe(false)
  })

  it('page vide : agenda de vente par défaut', () => {
    expect(urlRepli('', {}, '')).toBe('https://cyrillenovou-30mn.youcanbook.me/')
  })
})

describe('validation', () => {
  it('téléphone : formats français et internationaux, refus du trop court', () => {
    expect(erreurChamp('telephone', '06 12 34 56 78')).toBe('')
    expect(erreurChamp('telephone', '+1 (416) 555-0199')).toBe('')
    expect(erreurChamp('telephone', '0612')).not.toBe('')
    expect(erreurChamp('telephone', 'abc0612345678')).not.toBe('')
  })

  it('email, situation obligatoire, ancienneté à la lettre', () => {
    expect(erreurChamp('email', 'jane@example.com')).toBe('')
    expect(erreurChamp('email', 'jane@example')).not.toBe('')
    expect(erreurChamp('situation', '   ')).not.toBe('')
    expect(erreurChamp('anciennete', 'Plus de 2 ans')).toBe('')
    expect(erreurChamp('anciennete', 'plus de 2 ans')).not.toBe('')
  })
})
