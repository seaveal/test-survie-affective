// DisclaimerFooter — footer minimal pour écran d'accueil + écran de résultat.
//
// Décision Bloc 2 (2026-05-25, mission corrections-parcours-bloc2) :
// l'écran de résultat est réduit au nom du profil seul + invitation email.
// Le footer porte le disclaimer canonique Règle 12 (repositionnement coaching
// strict) et les 3 liens légaux.
//
// Fix 2026-06-15 : les liens pointaient vers l'apex souverainauquotidien.com
// (/cgv, /mentions-legales, /privacy) — non servi par Caddy → 403 (liens cassés).
// Chemins relatifs = domain-agnostic.
//
// Correction 2026-08-29 : les trois liens pointaient vers /legal/*, qui sert les
// documents d'AUTRES produits — /legal/terms rend « Conditions de service — H3C
// Analytics » (outil interne) et /legal/privacy « Politique de confidentialité —
// Chat-clients (H3C) » (application Instagram). Mentions légales et CGV menaient
// en plus à la MÊME page. Les documents du site existent et sont servis :
// /mentions-legales/, /cgv/ et /privacy/ (vérifié en HTTP 200, titres « Souverain
// au Quotidien (Cyrille NOVOU) »). Ne pas viser /confidentialite/ : ce chemin
// n'existe pas et retombe sur la SPA par le try_files de Caddy.
//
// Correction 2026-08-31 (WEB-T1-04, âge 97 j) : /cgv/ servait des CGV « v1 —
// 2026-05-25 », que huit publications ont remplacées. Les CGV maintenues sont
// la v3.4.1 du 24 août 2026 et elles couvrent l'EI entière (livre, formats
// cumulables, séminaires au Titre II section C) : elles sont transverses, pas
// propres au site livre. Le lien vise donc le document maintenu, en URL
// complète et JAMAIS par un raccourcisseur — un lien légal doit mener à la page
// légale et ne se mesure pas (garde h3c_links.CHEMINS_LEGAUX). /cgv/ reste servi
// et redirige vers la même cible, pour les liens déjà indexés.
//
// Ce qui NE change pas, et pourquoi :
//  - URL_MENTIONS reste local. La page de `livre` porte un « Objet du site » qui
//    dit « le site livre.souverainauquotidien.com présente et commercialise
//    l'ouvrage » : la publier ici identifierait le mauvais site, alors que la
//    LCEN (loi 2004-575, art. 6 III) demande l'identification du site consulté.
//    Elle a été COMPLÉTÉE sur place (RCS, APE, téléphone, médiation CM2C).
//  - URL_PRIVACY reste local. La politique du Test SA est déjà à jour (v2 du
//    2026-08-21, même date que celle de `livre`) et elle est la seule à décrire
//    le traitement propre à ce site : réponses au test chiffrées sous
//    consentement « données de santé » (RGPD art. 9). Rediriger la remplacerait
//    par un document plus récent en apparence, plus pauvre en fait.

const URL_MENTIONS = '/mentions-legales/'
const URL_CGV = 'https://livre.souverainauquotidien.com/cgv.html'
const URL_PRIVACY = '/privacy/'

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
