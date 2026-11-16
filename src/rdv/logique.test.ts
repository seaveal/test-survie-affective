import { describe, expect, it } from 'vitest'
import {
  canonique, chercherFuseaux, creneauEnClair, erreurChamp, fuseauUtile, grouperParJour,
  libelleFuseau, listeFuseaux, prerempliDepuis, CHOIX_PROVENANCE,
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

describe('pré-remplissage par l’adresse (plan du 16/11)', () => {
  it('prend prénom, nom, email, téléphone, noms hérités compris', () => {
    expect(prerempliDepuis(new URLSearchParams('FNAME=Jane&LNAME=Doe&EMAIL=jane@example.com&PHONE=%2B33612345678'))).toEqual({
      prenom: 'Jane', nom: 'Doe', email: 'jane@example.com', telephone: '+33612345678',
    })
    expect(prerempliDepuis(new URLSearchParams('prenom=Jane&tel=06%2012%2034%2056%2078'))).toEqual({ prenom: 'Jane', telephone: '06 12 34 56 78' })
  })

  it('ignore les valeurs invalides et ne touche jamais aux questions de qualification', () => {
    expect(prerempliDepuis(new URLSearchParams('EMAIL=pas-une-adresse&PHONE=12&prenom=&situation=x&anciennete=Plus%20de%202%20ans'))).toEqual({})
    expect(prerempliDepuis(new URLSearchParams(`prenom=${'a'.repeat(81)}`))).toEqual({})
  })
})

describe('provenance', () => {
  it('libellés à jour : Test renommé, bilan et YouTube, plus l’ancien nom', () => {
    expect(CHOIX_PROVENANCE).toContain('le Test de dépendance affective')
    expect(CHOIX_PROVENANCE).toContain('le bilan de RECONSTRUCTION AFFECTIVE')
    expect(CHOIX_PROVENANCE).toContain('une vidéo YouTube')
    expect(CHOIX_PROVENANCE).not.toContain('le Test de Survie Affective')
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

  it('objectif et provenance obligatoires (Cyrille, 16/11/2026 : « 2:oui »)', () => {
    expect(erreurChamp('objectif', '   ')).not.toBe('')
    expect(erreurChamp('objectif', 'Ne plus me perdre dans mes relations')).toBe('')
    expect(erreurChamp('provenance', '')).not.toBe('')
    expect(erreurChamp('provenance', 'une vidéo YouTube')).toBe('')
    expect(erreurChamp('provenance', 'une vidéo')).not.toBe('')
  })

  it('LinkedIn (lot C4) : vide ou adresse de profil, rien d’autre', () => {
    expect(erreurChamp('linkedin', '')).toBe('')
    expect(erreurChamp('linkedin', 'https://www.linkedin.com/in/jean-dupont-1a2b3c/')).toBe('')
    expect(erreurChamp('linkedin', 'linkedin.com/in/éloïse-m?utm_source=share')).toBe('')
    expect(erreurChamp('linkedin', 'https://www.linkedin.com/company/h3c')).not.toBe('')
    expect(erreurChamp('linkedin', 'https://evil.example/linkedin.com/in/x')).not.toBe('')
    expect(erreurChamp('linkedin', 'Jean Dupont')).not.toBe('')
  })
})
