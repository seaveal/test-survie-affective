// Questions du bilan RETROUVEZ-VOUS, mot pour mot depuis le vault
// 10-PRO/13-PHM/Marketing/Retrouvez-vous/QUESTIONS.md (décision Cyrille du 02/11/2026).
// Hors de src/data/ : ce fichier s'écrit à la main.
import type { QuestionContexte } from '../domain/types'
import type { DimensionRv, ReponseRv } from '../domain/rv/types'

export interface QuestionRv {
  id: string
  dimension: DimensionRv
  enonce: string
}

export const questionsRv: QuestionRv[] = [
  { id: 'Q01', dimension: 'realite', enonce: "Après un échange avec cette personne, vous arrive-t-il de douter de ce que vous avez entendu ou vécu ?" },
  { id: 'Q02', dimension: 'realite', enonce: "Vous arrive-t-il de minimiser vos émotions parce que cette personne vous a fait comprendre que vous exagériez ?" },
  { id: 'Q03', dimension: 'realite', enonce: "Avez-vous besoin qu'une autre personne confirme votre perception pour avoir la certitude de ne pas vous tromper ?" },
  { id: 'Q04', dimension: 'realite', enonce: "Vous arrive-t-il de repasser mentalement des conversations pour déterminer si vous êtes responsable de ce qui s'est passé ?" },
  { id: 'Q05', dimension: 'realite', enonce: "Avez-vous des difficultés à maintenir votre propre version des événements lorsque cette personne conteste vos souvenirs ?" },
  { id: 'Q06', dimension: 'attachement', enonce: "Pensez-vous encore très fréquemment à cette personne, même lorsque vous cherchez à vous concentrer sur autre chose ?" },
  { id: 'Q07', dimension: 'attachement', enonce: "Attendez-vous encore secrètement un message, des excuses ou un changement de comportement de sa part ?" },
  { id: 'Q08', dimension: 'attachement', enonce: "Votre humeur est-elle fortement influencée par ses messages, son silence ou son attitude envers vous ?" },
  { id: 'Q09', dimension: 'attachement', enonce: "Ressentez-vous le besoin de savoir ce qu'elle fait, ce qu'elle pense ou avec qui elle est ?" },
  { id: 'Q10', dimension: 'attachement', enonce: "Ressentez-vous encore une envie de reprendre contact, même lorsque vous savez que certains échanges vous font souffrir ?" },
  { id: 'Q11', dimension: 'securite', enonce: "Surveillez-vous constamment le ton, les expressions ou les réactions de cette personne pour anticiper son humeur ?" },
  { id: 'Q12', dimension: 'securite', enonce: "Une notification, un appel ou simplement l'évocation de cette personne provoque-t-il chez vous une tension ou une inquiétude ?" },
  { id: 'Q13', dimension: 'securite', enonce: "Modifiez-vous spontanément votre manière de parler ou d'agir pour éviter une réaction négative ?" },
  { id: 'Q14', dimension: 'securite', enonce: "Avez-vous du mal à vous détendre lorsque vous repensez à cette relation, même dans un environnement tranquille ?" },
  { id: 'Q15', dimension: 'securite', enonce: "Craignez-vous encore les conséquences d'un désaccord ou d'un refus de votre part ?" },
  { id: 'Q16', dimension: 'autonomie', enonce: "Avez-vous renoncé à certaines activités, décisions ou envies pour éviter les tensions dans cette relation ?" },
  { id: 'Q17', dimension: 'autonomie', enonce: "Avez-vous du mal à maintenir vos limites lorsque l'autre personne insiste ou vous culpabilise ?" },
  { id: 'Q18', dimension: 'autonomie', enonce: "Ressentez-vous le besoin de justifier excessivement vos décisions personnelles ?" },
  { id: 'Q19', dimension: 'autonomie', enonce: "Avez-vous progressivement réduit vos contacts avec certaines personnes ou certaines activités à cause de cette relation ?" },
  { id: 'Q20', dimension: 'autonomie', enonce: "Vous arrive-t-il de laisser les autres décider à votre place pour éviter un conflit ou une désapprobation ?" },
  { id: 'Q21', dimension: 'identite', enonce: "Avez-vous le sentiment de valoir moins, d'être moins capable ou moins digne d'amour qu'avant cette relation ?" },
  { id: 'Q22', dimension: 'identite', enonce: "Avez-vous perdu de vue ce que vous aimez réellement, ce que vous souhaitez et ce qui vous fait du bien ?" },
  { id: 'Q23', dimension: 'identite', enonce: "La critique ou le jugement de cette personne continue-t-il à influencer la manière dont vous vous percevez ?" },
  { id: 'Q24', dimension: 'identite', enonce: "Avez-vous délaissé des projets, des passions ou des activités qui comptaient pour vous ?" },
  { id: 'Q25', dimension: 'identite', enonce: "Avez-vous des difficultés à imaginer un avenir construit autour de vos propres envies et aspirations ?" },
]

/** Échelle identique pour les 25 questions. La sixième option n'est jamais lue comme un zéro. */
export const ECHELLE_RV: { valeur: ReponseRv, texte: string }[] = [
  { valeur: 0, texte: 'Jamais' },
  { valeur: 1, texte: 'Rarement' },
  { valeur: 2, texte: 'Parfois' },
  { valeur: 3, texte: 'Souvent' },
  { valeur: 4, texte: 'Presque toujours' },
  { valeur: null, texte: 'Je préfère ne pas répondre' },
]

/**
 * Contexte, après Q25, hors score. Forme des questions de contexte du Test pour
 * réutiliser ContextCard : `champCible` désigne le champ `situation` ou `pret_a_agir`.
 */
export const contexteRv: QuestionContexte[] = [
  {
    id: 26,
    type: 'contexte',
    enonce: "Où en êtes-vous avec cette personne aujourd'hui ?",
    champCible: 'situation',
    options: [
      { id: 'A', texte: 'Je suis encore dans cette relation', valeur: 'en_relation' },
      { id: 'B', texte: 'La relation est terminée depuis moins de six mois', valeur: 'separe_recent' },
      { id: 'C', texte: 'La relation est terminée depuis plus de six mois', valeur: 'separe_ancien' },
    ],
  },
  {
    id: 27,
    type: 'contexte',
    enonce: 'Où en êtes-vous dans votre envie de vous retrouver ?',
    champCible: 'pretAAgir',
    options: [
      { id: 'A', texte: "Je veux m'y mettre maintenant", valeur: 'maintenant' },
      { id: 'B', texte: 'Oui, mais pas tout de suite, dans quelques semaines ou mois', valeur: 'bientot' },
      { id: 'C', texte: "Je veux d'abord comprendre, lire, m'informer", valeur: 'comprendre_dabord' },
      { id: 'D', texte: 'Je ne sais pas encore', valeur: 'incertain' },
    ],
  },
]

/** Sécurité, dernière question, hors score. La réponse reste dans l'écran, jamais envoyée ni gardée. */
export type ReponseSecurite = 'oui' | 'non' | 'sans_reponse'

export const questionSecurite: { enonce: string, options: { valeur: ReponseSecurite, texte: string }[] } = {
  enonce: "Aujourd'hui, craignez-vous un danger immédiat pour votre sécurité ou celle de vos enfants ?",
  options: [
    { valeur: 'oui', texte: 'Oui' },
    { valeur: 'non', texte: 'Non' },
    { valeur: 'sans_reponse', texte: 'Je préfère ne pas répondre' },
  ],
}
