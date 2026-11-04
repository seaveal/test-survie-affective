// Page /rdv/ : demande de rendez-vous offert, une question par écran, le créneau à la
// fin, la vidéo après (décisions de Cyrille du 03/11/2026, PLAN du chantier RDV page maison).
// Autonome (décision 8) : rien du Test ne s'exécute ici ; le pré-remplissage est un bonus.

import {
  useCallback, useEffect, useMemo, useRef, useState,
  type Dispatch, type FormEvent, type ReactNode, type RefObject, type SetStateAction,
} from 'react'
import { emailDesJetons, jalon, lireCreneaux, reserver, signalerDemande } from './api'
import {
  CHOIX_ANCIENNETE, CHOIX_PROVENANCE, PAGE_YCBM, PARIS, REPONSES_VIDES, chercherFuseaux,
  creneauEnClair, erreurChamp, fuseauAppareil, grouperParJour, libelleFuseau, listeFuseaux,
  nouvelleCle, urlRepli, villeFuseau, type Reponses,
} from './logique'
import { AVERTISSEMENT, T } from './textes'

type Ecran = 'prenom' | 'situation' | 'anciennete' | 'objectif' | 'coordonnees' | 'provenance' | 'creneau' | 'confirmation'

interface Etat {
  ecran: Ecran
  r: Reponses
  origine: string
  fuseau: string | null
  debut: number
  cle: string
  fini: { creneau: number; fuseau: string } | null
}

const CLE_ETAT = 'rdv.etat'
const CLE_JALONS = 'rdv.jalons'
const JALON_ECRAN: Partial<Record<Ecran, string>> = {
  prenom: 'rdv_arrivee', situation: 'rdv_situation', anciennete: 'rdv_anciennete', objectif: 'rdv_objectif',
  coordonnees: 'rdv_coordonnees', provenance: 'rdv_provenance', creneau: 'rdv_creneaux',
}
const ECRAN_DU_CHAMP: Record<string, Ecran> = {
  prenom: 'prenom', situation: 'situation', anciennete: 'anciennete', objectif: 'objectif', nom: 'coordonnees',
  email: 'coordonnees', telephone: 'coordonnees', provenance: 'provenance', fuseau: 'creneau',
}
const VIDEO = import.meta.env?.VITE_RDV_VIDEO_URL as string | undefined
const AFFICHE = import.meta.env?.VITE_RDV_VIDEO_POSTER as string | undefined

function etatInitial(): Etat {
  const q = new URLSearchParams(location.search)
  const h3c = q.get('h3c') ?? ''
  const neuf: Etat = {
    ecran: 'prenom', r: { ...REPONSES_VIDES }, origine: /^[A-Za-z0-9_-]{1,64}$/.test(h3c) ? h3c : '',
    fuseau: fuseauAppareil(), debut: Date.now(), cle: '', fini: null,
  }
  try {
    const garde = JSON.parse(sessionStorage.getItem(CLE_ETAT) || 'null') as Etat | null
    if (garde && garde.r && garde.ecran) return { ...neuf, ...garde, r: { ...neuf.r, ...garde.r }, origine: neuf.origine || garde.origine }
  } catch {
    // stockage indisponible ou illisible : départ à neuf
  }
  return neuf
}

/** Un compteur par écran et par visite (onglet), même après un rechargement. */
function compterEcran(nom: string): void {
  let vus: string[] = []
  try {
    vus = JSON.parse(sessionStorage.getItem(CLE_JALONS) || '[]') as string[]
  } catch {
    // stockage indisponible : compté à chaque affichage
  }
  if (vus.includes(nom)) return
  jalon(nom)
  try {
    sessionStorage.setItem(CLE_JALONS, JSON.stringify([...vus, nom]))
  } catch {
    // idem
  }
}

function lireStockage(cle: string): string | undefined {
  try {
    return localStorage.getItem(cle) || undefined
  } catch {
    return undefined
  }
}

/** Décalage du clavier ouvert, pour garder le bouton visible au-dessus (`visualViewport`). */
function useClavier() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const maj = () => {
      const bas = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--rdv-clavier', `${Math.round(bas)}px`)
    }
    vv.addEventListener('resize', maj)
    vv.addEventListener('scroll', maj)
    maj()
    return () => {
      vv.removeEventListener('resize', maj)
      vv.removeEventListener('scroll', maj)
    }
  }, [])
}

export default function AppRdv() {
  const [etat, setEtat] = useState<Etat>(etatInitial)
  const [erreurs, setErreurs] = useState<Partial<Record<string, string>>>({})
  const [message, setMessage] = useState('')
  const [repli, setRepli] = useState(false)
  const pageServeur = useRef('')
  const titre = useRef<HTMLHeadingElement>(null)
  useClavier()

  const ordre = useMemo<Ecran[]>(
    () => ['prenom', 'situation', 'anciennete', 'objectif', 'coordonnees', ...(etat.origine ? [] : ['provenance' as Ecran]), 'creneau'],
    [etat.origine],
  )

  // Sauvegarde à chaque changement : rechargement, appel entrant, retour d'une autre application.
  useEffect(() => {
    try {
      sessionStorage.setItem(CLE_ETAT, JSON.stringify(etat))
    } catch {
      // la page marche sans
    }
  }, [etat])

  const etatRef = useRef(etat)
  useEffect(() => {
    etatRef.current = etat
  }, [etat])

  const partirVersYcbm = useCallback((page?: string) => {
    jalon('rdv_repli')
    setRepli(true)
    const e = etatRef.current
    location.assign(urlRepli(page || pageServeur.current || PAGE_YCBM, e.r, e.origine))
  }, [])

  // Arrivée : historique de l'écran courant, adresse pré-remplie, drapeau du serveur.
  useEffect(() => {
    history.replaceState({ rdv: etat.ecran }, '')
    const onPop = (ev: PopStateEvent) => {
      const vers = (ev.state as { rdv?: Ecran } | null)?.rdv
      setMessage('')
      setEtat((e) => (e.fini ? { ...e, ecran: 'confirmation' } : { ...e, ecran: vers ?? 'prenom' }))
    }
    window.addEventListener('popstate', onPop)

    const q = new URLSearchParams(location.search)
    const lien = window.h3cEmailLien?.() || q.get('EMAIL') || undefined
    if (q.has('EMAIL')) {
      q.delete('EMAIL')
      const s = q.toString()
      history.replaceState(history.state, '', location.pathname + (s ? `?${s}` : '') + location.hash)
    }
    const cycle = lireStockage('tsa.reprise') || lireStockage('rv.reprise')
    let contact: string | undefined
    try {
      contact = window.h3cContact?.() || undefined
    } catch {
      contact = undefined
    }
    void emailDesJetons(cycle, contact).then((connu) => {
      const email = connu || lien
      if (email) setEtat((e) => (e.r.email ? e : { ...e, r: { ...e.r, email } }))
    })
    void lireCreneaux().then((issue) => {
      if (issue.etat === 'ok') pageServeur.current = issue.page
      if (issue.etat === 'inactive') partirVersYcbm(issue.page)
    })
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, à l'arrivée
  }, [])

  // Compteur d'écran (un par visite) et focus sur la question.
  useEffect(() => {
    titre.current?.focus()
    const nom = JALON_ECRAN[etat.ecran]
    if (nom) compterEcran(nom)
  }, [etat.ecran])

  const aller = useCallback((ecran: Ecran) => {
    history.pushState({ rdv: ecran }, '')
    setEtat((e) => ({ ...e, ecran }))
    window.scrollTo(0, 0)
  }, [])

  const poser = (champ: keyof Reponses, v: string | boolean) => {
    setErreurs((x) => ({ ...x, [champ]: '' }))
    setEtat((e) => ({ ...e, r: { ...e.r, [champ]: v } }))
  }

  const suivant = (champs: (keyof Reponses)[]) => (ev?: FormEvent) => {
    ev?.preventDefault()
    const trouvees: Record<string, string> = {}
    for (const c of champs) {
      const err = erreurChamp(c, String(etat.r[c] ?? ''))
      if (err) trouvees[c] = err
    }
    setErreurs(trouvees)
    if (Object.keys(trouvees).length) return
    const i = ordre.indexOf(etat.ecran)
    aller(ordre[Math.min(i + 1, ordre.length - 1)])
  }

  if (repli) return <Cadre><p className="py-16 text-center text-base" role="status">{T.repli}</p></Cadre>

  const { r } = etat
  const salut = r.prenom.trim() && etat.ecran !== 'prenom' ? T.merci(r.prenom.trim()) : ''
  const premier = etat.ecran === 'prenom'

  const ecranQuestion = (props: {
    question: string
    aide?: string
    champs: (keyof Reponses)[]
    children: ReactNode
    facultatif?: boolean
  }) => (
    <form onSubmit={suivant(props.champs)} noValidate>
      {premier && (
        <div className="mb-8 space-y-3 text-base leading-relaxed">
          {T.pitch.map((p) => <p key={p}>{p}</p>)}
        </div>
      )}
      {salut &&<p className="mb-2 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{salut}</p>}
      <h1 ref={titre} tabIndex={-1} id="rdv-question" className="text-2xl leading-snug outline-none">{props.question}</h1>
      {props.facultatif && <p className="mt-1 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{T.objectif.facultatif}</p>}
      {props.aide && <p id="rdv-aide" className="mt-2 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{props.aide}</p>}
      <div className="mt-6 space-y-4">{props.children}</div>
      <Erreurs erreurs={props.champs.map((c) => erreurs[c]).filter(Boolean) as string[]} />
      <Barre>
        {!premier && <BoutonRetour />}
        <button type="submit" className="tsa-cta-terracotta min-h-12 flex-1 rounded-xl px-6 text-base font-medium text-white">
          {T.continuer}
        </button>
      </Barre>
    </form>
  )

  let contenu: ReactNode
  switch (etat.ecran) {
    case 'prenom':
      contenu = ecranQuestion({
        question: T.prenom.question,
        champs: ['prenom'],
        children: (
          <Champ id="prenom" label={T.prenom.question} cache value={r.prenom} onChange={(v) => poser('prenom', v)}
            autoComplete="given-name" erreur={erreurs.prenom} />
        ),
      })
      break
    case 'situation':
      contenu = ecranQuestion({
        question: T.situation.question,
        aide: T.situation.aide,
        champs: ['situation'],
        children: <Zone id="situation" label={T.situation.question} value={r.situation} onChange={(v) => poser('situation', v)} erreur={erreurs.situation} />,
      })
      break
    case 'anciennete':
      contenu = ecranQuestion({
        question: T.anciennete.question,
        champs: ['anciennete'],
        children: (
          <Choix choix={CHOIX_ANCIENNETE} valeur={r.anciennete} onChoix={(v) => {
            poser('anciennete', v)
            setTimeout(() => aller(ordre[ordre.indexOf('anciennete') + 1]), 180)
          }} />
        ),
      })
      break
    case 'objectif':
      contenu = ecranQuestion({
        question: T.objectif.question,
        aide: T.objectif.aide,
        facultatif: true,
        champs: [],
        children: <Zone id="objectif" label={T.objectif.question} value={r.objectif} onChange={(v) => poser('objectif', v)} />,
      })
      break
    case 'coordonnees':
      contenu = ecranQuestion({
        question: T.coordonnees.question,
        champs: ['nom', 'email', 'telephone'],
        children: (
          <>
            <Champ id="nom" label={T.coordonnees.nom} value={r.nom} onChange={(v) => poser('nom', v)} autoComplete="family-name" erreur={erreurs.nom} />
            <Champ id="email" label={T.coordonnees.email} aide={T.coordonnees.emailAide} value={r.email} onChange={(v) => poser('email', v)}
              autoComplete="email" type="email" inputMode="email" erreur={erreurs.email} />
            <Champ id="telephone" label={T.coordonnees.telephone} aide={T.coordonnees.telephoneAide} value={r.telephone}
              onChange={(v) => poser('telephone', v)} autoComplete="tel" type="tel" inputMode="tel" erreur={erreurs.telephone} />
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-base">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#A8432B]" checked={r.sms} onChange={(ev) => poser('sms', ev.target.checked)} aria-describedby="sms-aide" />
              <span>
                {T.coordonnees.sms}
                <span id="sms-aide" className="mt-1 block text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{T.coordonnees.smsAide}</span>
              </span>
            </label>
          </>
        ),
      })
      break
    case 'provenance':
      contenu = ecranQuestion({
        question: T.provenance.question,
        facultatif: true,
        champs: [],
        children: (
          <Choix choix={CHOIX_PROVENANCE} valeur={r.provenance} onChoix={(v) => {
            poser('provenance', v)
            setTimeout(() => aller('creneau'), 180)
          }} />
        ),
      })
      break
    case 'creneau':
      contenu = (
        <EcranCreneau
          etat={etat}
          titre={titre}
          message={message}
          setMessage={setMessage}
          setEtat={setEtat}
          aller={aller}
          erreurChampServeur={(champ, msg) => {
            setErreurs({ [champ]: msg })
            aller(ECRAN_DU_CHAMP[champ] ?? 'coordonnees')
          }}
          partirVersYcbm={partirVersYcbm}
          pageServeur={pageServeur}
        />
      )
      break
    case 'confirmation':
      contenu = <Confirmation etat={etat} titre={titre} />
      break
  }

  return <Cadre>{contenu}</Cadre>
}

function EcranCreneau({
  etat, titre, message, setMessage, setEtat, aller, erreurChampServeur, partirVersYcbm, pageServeur,
}: {
  etat: Etat
  titre: RefObject<HTMLHeadingElement | null>
  message: string
  setMessage: (m: string) => void
  setEtat: Dispatch<SetStateAction<Etat>>
  aller: (e: Ecran) => void
  erreurChampServeur: (champ: string, msg: string) => void
  partirVersYcbm: (page?: string) => void
  pageServeur: RefObject<string>
}) {
  const [creneaux, setCreneaux] = useState<number[] | null>(null)
  const [choix, setChoix] = useState<number | null>(null)
  const [jourChoisi, setJourChoisi] = useState('')
  const [changer, setChanger] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const enVol = useRef(false)
  const [tour, setTour] = useState(0) // relecture des créneaux après un créneau pris

  useEffect(() => {
    let vivant = true
    void lireCreneaux().then((issue) => {
      if (!vivant) return
      if (issue.etat === 'ok') {
        pageServeur.current = issue.page
        setCreneaux(issue.creneaux)
      } else partirVersYcbm(issue.etat === 'inactive' ? issue.page : undefined)
    })
    return () => {
      vivant = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- relu à chaque tour seulement
  }, [tour])

  const fuseau = etat.fuseau
  const jours = useMemo(() => (creneaux && fuseau ? grouperParJour(creneaux, fuseau) : []), [creneaux, fuseau])
  const jour = jours.find((j) => j.cle === jourChoisi) ?? jours[0]

  if (!fuseau || changer) {
    return (
      <ChoixFuseau
        titre={titre}
        actuel={fuseau}
        onChoix={(tz) => {
          setEtat((e) => ({ ...e, fuseau: tz }))
          setChanger(false)
        }}
      />
    )
  }

  const demander = async () => {
    if (enVol.current || choix === null) return
    enVol.current = true
    setEnvoi(true)
    setMessage('')
    const cle = etat.cle || nouvelleCle()
    setEtat((e) => ({ ...e, cle }))
    try {
      sessionStorage.setItem(CLE_ETAT, JSON.stringify({ ...etat, cle }))
    } catch {
      // la clé reste en mémoire
    }
    const r = etat.r
    const issue = await reserver({
      cle, prenom: r.prenom.trim(), nom: r.nom.trim(), email: r.email.trim(), telephone: r.telephone.trim(),
      situation: r.situation.trim(), anciennete: r.anciennete, objectif: r.objectif.trim(), provenance: r.provenance,
      origine: etat.origine, creneau: choix, fuseau, sms_rappels: r.sms,
      site_web: (document.getElementById('site_web') as HTMLInputElement | null)?.value ?? '',
      duree_ms: Date.now() - etat.debut,
    })
    enVol.current = false
    setEnvoi(false)
    switch (issue.etat) {
      case 'ok':
        setEtat((e) => ({ ...e, cle: '', fini: { creneau: issue.creneau, fuseau: issue.fuseau }, ecran: 'confirmation' }))
        history.replaceState({ rdv: 'confirmation' }, '')
        signalerDemande(issue.eventId)
        window.scrollTo(0, 0)
        return
      case 'creneau_pris':
        setEtat((e) => ({ ...e, cle: '' }))
        setChoix(null)
        setMessage(T.creneau.pris)
        setCreneaux(null)
        setTour((t) => t + 1)
        return
      case 'champ':
        setEtat((e) => ({ ...e, cle: '' }))
        if (issue.champ === 'fuseau') {
          setChanger(true)
          return
        }
        erreurChampServeur(issue.champ, issue.message || erreurChamp(issue.champ as keyof Reponses, '') || 'Cette réponse est à corriger.')
        return
      case 'deja_demande':
        setEtat((e) => ({ ...e, cle: '' }))
        setMessage(T.creneau.dejaDemande)
        return
      case 'panne':
        partirVersYcbm()
        return
    }
  }

  return (
    <div>
      <h1 ref={titre} tabIndex={-1} className="text-2xl leading-snug outline-none">{T.creneau.titre}</h1>
      <p className="mt-3 text-base">
        {T.creneau.pour} <strong>{`${etat.r.prenom.trim()} ${etat.r.nom.trim()}`}</strong> · {etat.r.email.trim()}
      </p>
      <button type="button" className="mt-1 min-h-11 text-sm underline" style={{ color: 'var(--h3c-accent-terracotta)' }} onClick={() => aller('prenom')}>
        {T.creneau.modifier}
      </button>
      <p className="mt-4 text-sm">
        {T.creneau.heures} <strong>{libelleFuseau(fuseau)}</strong> ·{' '}
        <button type="button" className="min-h-11 underline" style={{ color: 'var(--h3c-accent-terracotta)' }} onClick={() => setChanger(true)}>
          {T.creneau.changer}
        </button>
      </p>
      <p aria-live="polite" role="status" className="mt-3 text-base" style={{ color: 'var(--h3c-erreur)' }}>{message}</p>
      {creneaux === null ? (
        <div aria-busy="true" aria-label={T.creneau.chargement} className="mt-4 space-y-3">
          <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 w-28 shrink-0 animate-pulse rounded-xl bg-black/5" />)}</div>
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-black/5" />)}</div>
        </div>
      ) : jours.length === 0 ? (
        <p className="mt-6 text-base">{T.creneau.aucun}</p>
      ) : (
        <>
          <div className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2" role="tablist" aria-label="Jours">
            {jours.map((j) => (
              <button key={j.cle} type="button" role="tab" aria-selected={j.cle === jour?.cle}
                className="min-h-14 shrink-0 snap-start rounded-xl border px-4 text-sm first-letter:uppercase"
                style={j.cle === jour?.cle
                  ? { background: 'var(--h3c-accent-terracotta)', color: '#fff', borderColor: 'var(--h3c-accent-terracotta)' }
                  : { background: 'var(--h3c-fond-card)', borderColor: 'var(--h3c-bordure)' }}
                onClick={() => setJourChoisi(j.cle)}>
                {j.libelle}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={jour?.libelle}>
            {jour?.creneaux.map((c) => (
              <button key={c.ms} type="button" role="radio" aria-checked={choix === c.ms} data-ms={c.ms}
                className="min-h-12 rounded-xl border text-base"
                style={choix === c.ms
                  ? { background: 'var(--h3c-accent-terracotta)', color: '#fff', borderColor: 'var(--h3c-accent-terracotta)' }
                  : { background: 'var(--h3c-fond-card)', borderColor: 'var(--h3c-bordure)' }}
                onClick={() => setChoix(c.ms)}>
                {c.heure}
              </button>
            ))}
          </div>
        </>
      )}
      {/* Champ piège : invisible pour une personne, rempli par les robots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="site_web">Site web</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <Barre>
        <div className="flex flex-1 flex-col gap-2">
          <button type="button" disabled={choix === null || envoi} onClick={() => void demander()}
            className="tsa-cta-terracotta min-h-12 w-full rounded-xl px-6 text-base font-medium text-white disabled:opacity-50">
            {envoi ? T.creneau.envoi : T.creneau.bouton}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--h3c-texte-secondaire)' }}>{T.creneau.sous}</p>
        </div>
      </Barre>
    </div>
  )
}

function ChoixFuseau({ titre, actuel, onChoix }: { titre: RefObject<HTMLHeadingElement | null>; actuel: string | null; onChoix: (tz: string) => void }) {
  const [q, setQ] = useState('')
  const tous = useMemo(() => listeFuseaux(), [])
  const trouves = chercherFuseaux(tous, q).slice(0, 40)
  useEffect(() => titre.current?.focus(), [titre])
  return (
    <div>
      <h1 ref={titre} tabIndex={-1} className="text-2xl leading-snug outline-none">{T.fuseau.question}</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{T.fuseau.aide}</p>
      <button type="button" className="tsa-cta-terracotta mt-6 min-h-12 w-full rounded-xl px-6 text-base font-medium text-white" onClick={() => onChoix(PARIS)}>
        {T.fuseau.paris}
      </button>
      <label htmlFor="fuseau-recherche" className="mt-6 block text-base">{T.fuseau.chercher}</label>
      <p className="text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{T.fuseau.chercherAide}</p>
      <input id="fuseau-recherche" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border px-4 text-base" style={{ borderColor: 'var(--h3c-bordure)', background: 'var(--h3c-fond-card)' }} />
      <ul className="mt-3 space-y-1" aria-live="polite">
        {trouves.length === 0 && <li className="text-base">{T.fuseau.aucun}</li>}
        {trouves.map((tz) => (
          <li key={tz}>
            <button type="button" onClick={() => onChoix(tz)} aria-current={tz === actuel}
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-base hover:bg-black/5">
              <span>{villeFuseau(tz)}</span>
              <span className="text-xs" style={{ color: 'var(--h3c-texte-secondaire)' }}>{tz}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Confirmation({ etat, titre }: { etat: Etat; titre: RefObject<HTMLHeadingElement | null> }) {
  const video = useRef<HTMLVideoElement>(null)
  return (
    <div>
      <p role="status" className="rounded-xl px-4 py-3 text-base"
        style={{ background: '#eef4ef', borderLeft: '4px solid var(--h3c-succes)', color: 'var(--h3c-texte-principal)' }}>
        {T.confirmation.bandeau}
      </p>
      {etat.fini && (
        <p className="mt-3 text-base">
          {T.confirmation.creneau} <strong>{creneauEnClair(etat.fini.creneau, etat.fini.fuseau)}</strong>
        </p>
      )}
      <div className="mt-8">
        <h1 ref={titre} tabIndex={-1} className="text-2xl leading-snug outline-none">{T.confirmation.titre}</h1>
      </div>
      {VIDEO && (
        <div className="mt-4">
          <video ref={video} src={VIDEO} poster={AFFICHE} playsInline muted autoPlay preload="metadata" controls className="w-full rounded-xl bg-black" />
          <button type="button" className="mt-2 min-h-11 text-base underline" style={{ color: 'var(--h3c-accent-terracotta)' }}
            onClick={() => {
              const v = video.current
              if (!v) return
              v.muted = false
              v.currentTime = 0
              void v.play().catch(() => {})
            }}>
            {T.confirmation.son}
          </button>
        </div>
      )}
      <ol className="mt-6 space-y-4">
        {T.confirmation.etapes.map(([quand, quoi], i) => (
          <li key={quand} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-white" style={{ background: 'var(--h3c-accent-terracotta)' }}>{i + 1}</span>
            <span className="text-base"><strong>{quand}</strong> : {quoi}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <h2 className="text-lg">{T.confirmation.rienTitre}</h2>
      </div>
      <p className="mt-2 text-base">
        {T.confirmation.rien} <a className="underline" href="mailto:cyrille@h3c.life">cyrille@h3c.life</a>.
      </p>
    </div>
  )
}

function Cadre({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-lg px-4 pt-6" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        {/* mt-6 : le titre commence sous le bouton « Cookies », fixé en haut à droite. */}
        <header className="mb-6 mt-6 flex items-center gap-4" style={{ color: 'var(--h3c-accent-terracotta)', fontFamily: 'var(--font-eyebrow)' }}>
          {/* Vignette façon Instagram, cercle dégradé autour (demande Cyrille du 04/11/2026). */}
          <span className="shrink-0 rounded-full p-[3px]" style={{ background: 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)' }}>
            <img src="/portrait-cyrille.webp" alt="Cyrille Novou" width={64} height={64}
              className="block h-16 w-16 rounded-full border-[3px] object-cover" style={{ borderColor: 'var(--h3c-fond-principal)' }} />
          </span>
          <div>
            <p className="text-2xl font-semibold uppercase leading-tight tracking-[0.04em] sm:text-3xl">{T.entete}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.14em]">{T.enteteDetail}</p>
          </div>
        </header>
        {children}
      </main>
      <footer className="mx-auto mt-8 max-w-lg px-4 pt-6" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))', color: 'var(--h3c-texte-secondaire)', borderTop: '1px solid var(--h3c-bordure)' }}>
        <p className="text-xs leading-relaxed"><strong>Avertissement.</strong> {AVERTISSEMENT}</p>
        <nav className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs">
          <a href="/mentions-legales/" className="tsa-lien-legal underline">Mentions légales</a>
          <span aria-hidden>·</span>
          <a href="/cgv/" className="tsa-lien-legal underline">CGV</a>
          <span aria-hidden>·</span>
          <a href="/privacy/" className="tsa-lien-legal underline">Politique de confidentialité</a>
        </nav>
      </footer>
    </>
  )
}

/** Barre d'action fixe, au-dessus du clavier ouvert et de la barre d'accueil. */
function Barre({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 z-10 border-t px-4 pt-3"
      style={{
        bottom: 'var(--rdv-clavier, 0px)', background: 'var(--h3c-fond-principal)', borderColor: 'var(--h3c-bordure)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}>
      <div className="mx-auto flex max-w-lg items-start gap-3">{children}</div>
    </div>
  )
}

function BoutonRetour() {
  return (
    <button type="button" onClick={() => history.back()} className="min-h-12 rounded-xl border px-4 text-base" style={{ borderColor: 'var(--h3c-bordure)' }}>
      {T.retour}
    </button>
  )
}

function Erreurs({ erreurs }: { erreurs: string[] }) {
  return (
    <div aria-live="assertive" role="alert" className="mt-3 text-base" style={{ color: 'var(--h3c-erreur)' }}>
      {erreurs.map((e) => <p key={e}>{e}</p>)}
    </div>
  )
}

function Champ(p: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  aide?: string
  erreur?: string
  type?: string
  inputMode?: 'email' | 'tel' | 'text'
  cache?: boolean
}) {
  return (
    <div>
      <label htmlFor={p.id} className={p.cache ? 'sr-only' : 'block text-base'}>{p.label}</label>
      {p.aide && <p id={`${p.id}-aide`} className="text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>{p.aide}</p>}
      <input id={p.id} name={p.id} type={p.type ?? 'text'} inputMode={p.inputMode} autoComplete={p.autoComplete} value={p.value}
        onChange={(e) => p.onChange(e.target.value)} aria-invalid={!!p.erreur} aria-describedby={p.aide ? `${p.id}-aide` : undefined}
        maxLength={p.id === 'email' ? 254 : 80}
        className="mt-2 min-h-12 w-full rounded-xl border px-4 text-base"
        style={{ borderColor: p.erreur ? 'var(--h3c-erreur)' : 'var(--h3c-bordure)', background: 'var(--h3c-fond-card)', fontSize: '16px' }} />
    </div>
  )
}

function Zone(p: { id: string; label: string; value: string; onChange: (v: string) => void; erreur?: string }) {
  return (
    <div>
      <label htmlFor={p.id} className="sr-only">{p.label}</label>
      <textarea id={p.id} name={p.id} rows={5} value={p.value} maxLength={2000} aria-describedby="rdv-aide" aria-invalid={!!p.erreur}
        onChange={(e) => p.onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 text-base"
        style={{ borderColor: p.erreur ? 'var(--h3c-erreur)' : 'var(--h3c-bordure)', background: 'var(--h3c-fond-card)', fontSize: '16px' }} />
    </div>
  )
}

function Choix(p: { choix: readonly string[]; valeur: string; onChoix: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-labelledby="rdv-question" className="space-y-2">
      {p.choix.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={p.valeur === c} onClick={() => p.onChoix(c)}
          className="min-h-12 w-full rounded-xl border px-4 py-3 text-left text-base"
          style={p.valeur === c
            ? { background: 'var(--h3c-accent-terracotta)', color: '#fff', borderColor: 'var(--h3c-accent-terracotta)' }
            : { background: 'var(--h3c-fond-card)', borderColor: 'var(--h3c-bordure)' }}>
          {c}
        </button>
      ))}
    </div>
  )
}
