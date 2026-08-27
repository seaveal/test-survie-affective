// DisclaimerFooter — footer minimal pour écran d'accueil + écran de résultat.
//
// Décision Bloc 2 (2026-05-25, mission corrections-parcours-bloc2) :
// l'écran de résultat est réduit au nom du profil seul + invitation email.
// Le footer porte le disclaimer canonique Règle 12 (repositionnement coaching
// strict) et les 3 liens légaux.
//
// Fix 2026-06-15 : les liens pointaient vers l'apex souverainauquotidien.com
// (/cgv, /mentions-legales, /privacy) — non servi par Caddy → 403 (liens cassés).
// On pointe désormais vers les pages légales réelles servies sur le même domaine
// (test.souverainauquotidien.com/legal/*, HTML statique /var/www/legal). Chemins
// relatifs = domain-agnostic. terms.html (« Conditions de service ») contient
// aussi l'Éditeur → sert de CGV ET de mentions légales.

const URL_MENTIONS = '/legal/terms'
const URL_CGV = '/legal/terms'
const URL_PRIVACY = '/legal/privacy'

export function DisclaimerFooter() {
  return (
    <footer
      className="mx-auto mt-8 max-w-2xl px-6 pb-10 pt-6"
      style={{
        color: 'var(--h3c-texte-secondaire)',
        borderTop: '1px solid var(--h3c-bordure)',
      }}
    >
      <p className="text-xs leading-relaxed">
        <strong>Avertissement.</strong> Le Test de survie affective et le programme
        Régénération relèvent du coaching et du développement personnel. Ils ne
        constituent pas un soin médical, ni une psychothérapie au sens de la loi
        du 25 juillet 1985. Ils ne se substituent pas à un suivi par un
        professionnel de santé habilité (médecin, psychiatre, psychologue,
        psychothérapeute reconnu ARS). Si vous traversez une situation nécessitant
        un accompagnement médical (idéation suicidaire, dépression sévère,
        troubles psychiatriques actifs, addictions sévères), consultez un
        professionnel de santé ou appelez le <strong>3114</strong> (numéro
        national de prévention du suicide, gratuit, 24/7).
      </p>
      <nav className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs">
        <a href={URL_MENTIONS} className="tsa-lien-legal underline">
          Mentions légales
        </a>
        <span aria-hidden>·</span>
        <a href={URL_CGV} className="tsa-lien-legal underline">
          CGV
        </a>
        <span aria-hidden>·</span>
        <a href={URL_PRIVACY} className="tsa-lien-legal underline">
          Politique de confidentialité
        </a>
      </nav>
    </footer>
  )
}
