// Tous les textes d'écran du bilan RETROUVEZ-VOUS, en un seul objet. Copie des
// canoniques du vault (10-PRO/13-PHM/Marketing/Retrouvez-vous/PAGE-ACCUEIL.md et
// PAGE-RESULTAT.md, Operator Stack du 02/11/2026, statut pending-cyrille) : on
// les remplace ici en une fois, jamais dans les composants.
import type { DimensionRv } from '../domain/rv/types'

const DIMENSIONS: Record<DimensionRv, string> = {
  realite: 'Confiance dans votre propre réalité',
  attachement: 'Attachement émotionnel',
  securite: 'Sécurité émotionnelle',
  autonomie: 'Autonomie et limites personnelles',
  identite: 'Identité et estime de soi',
}

export const TEXTES_RV = {
  meta: {
    titre: "RETROUVEZ-VOUS, le bilan après une relation d'emprise · Cyrille Novou",
    description:
      "Le bilan personnel de reconstruction après une relation d'emprise. Cinq dimensions, 5 à 7 minutes, gratuit. Votre priorité à l'écran, votre bilan complet par email.",
  },
  /** Nom porté par l'avertissement du pied de page. */
  nomTest: 'Le bilan RETROUVEZ-VOUS',
  chargement: 'Chargement de votre bilan…',
  dimensions: DIMENSIONS,
  accueil: {
    surtitre: 'Bilan personnel offert',
    /** Le carton de fin des vidéos, mot pour mot. */
    titre: 'Et vous ? Comment réussissez-vous si bien à tomber dans le panneau ?',
    sousTitre: "Vous avez compris ce qui s'est passé. Et pourtant, c'est encore aussi difficile.",
    demande: 'Prenez cinq à sept minutes pour regarder ce qui se passe en vous.',
    bouton: 'Commencer mon bilan',
    sousBouton: "Gratuit, 5 à 7 minutes, résultat à l'écran puis bilan complet par email.",
    corps: [
      'Vous avez lu, écouté, décortiqué. Vous savez nommer le cycle, ses retournements, ses retours.',
      "Vous avez quitté cette personne, ou vous y songez, ou vous êtes encore dans cette relation sans savoir comment en sortir. Dans les trois cas, une même constatation : comprendre n'a pas suffi.",
      'Vous doutez davantage de vos décisions. Vous repassez certaines conversations en vous demandant si vous avez exagéré, si la responsabilité est la vôtre, si vous avez mal compris. Il arrive même que vous ne vous reconnaissiez plus.',
      "S'y ajoutent de l'attachement, de la colère, de la tristesse, un manque difficile à expliquer. Un nom, un numéro, un message, et le cœur sursaute avant que la tête ait eu le temps de comprendre.",
      "La question posée à la fin de la vidéo est volontairement provocante. Elle rend sa part à chacun : on entre dans une emprise avec ses propres schémas, appris tôt, et c'est précisément ce qui se travaille.",
      "La tête a tout compris. Dans le corps, l'alerte, l'attente, le doute et l'effacement sont restés en place. Ce bilan commence par là.",
    ],
    dimensions: [
      'Votre confiance dans votre propre réalité : perceptions, mémoire des événements et jugement.',
      'Votre attachement émotionnel : manque, attente et pensées récurrentes.',
      'Votre sécurité émotionnelle : vigilance, anticipation et tranquillité.',
      'Votre autonomie personnelle : choix, limites et préférences.',
      'Votre identité et votre estime de vous-même : envies, qualités et projets.',
    ],
    apresTitre: 'Après le bilan',
    apres:
      'Vous recevez cinq repères sur 20, montrés séparément, votre priorité nommée et trois pistes pour commencer. Le bilan complet vous est envoyé par email, avec une séance de descente dans le corps offerte, dix-sept minutes, guidée par la voix de Cyrille. Si vous le souhaitez, Cyrille vous propose ensuite un appel de 30 minutes, offert, sans obligation.',
    demandeBas: "Après tout le temps passé à comprendre l'autre, regardez ce qui se passe en vous.",
    prudence: "Ce bilan est un outil d'observation de soi : il ne pose aucune étiquette et ne juge pas l'autre personne.",
  },
  questions: {
    consigne:
      "Répondez en pensant à cette relation et à ses conséquences au cours des trente derniers jours, que vous soyez encore dans cette relation ou qu'elle soit terminée.",
    retour: '← Question précédente',
  },
  capture: {
    surtitre: 'Votre bilan complet',
    titre: 'Où voulez-vous recevoir votre bilan ?',
    phrase:
      "Votre email sert à vous envoyer le bilan complet et à sauvegarder vos réponses, pour que vous puissiez reprendre plus tard. Votre priorité s'affichera à l'écran à la fin du bilan.",
    bouton: 'Sauvegarder et continuer',
    sousBouton: 'Bilan complet et séance de descente dans le corps offerts, sans carte bancaire.',
    caseSuite:
      "Je souhaite recevoir la suite par email (les textes de Cyrille Novou, ses séances guidées, ses propositions d'accompagnement), avec une désinscription en un clic en bas de chaque email.",
    noteCase: 'Le bilan complet et la séance offerte partent dans tous les cas : cette case est facultative.',
  },
  /** Refus définitifs de /api/test-debut : l'email est redemandé. */
  refus: {
    422: "Votre adresse n'a pas pu être enregistrée. Vérifiez-la, puis validez à nouveau.",
    410: 'Cette adresse a été supprimée de nos fichiers. Indiquez une autre adresse pour continuer.',
  },
  securite: {
    note: "Votre réponse reste sur cet écran : elle n'est ni envoyée ni enregistrée.",
  },
  resultat: {
    priorite: 'Votre priorité',
    /** Titre de la liste des cinq scores. */
    surtitre: 'Vos cinq repères',
    reperes:
      'Voici vos cinq repères sur 20, montrés séparément et sans total : ils indiquent où votre attention est la plus sollicitée, sans verdict.',
    incomplet:
      "Quand une dimension compte trop peu de réponses, son repère reste vide : vous pouvez recommencer le bilan, ou en parler lors de l'appel.",
    emailOk: 'Votre bilan complet arrive par email dans quelques minutes, avec la séance de descente dans le corps offerte.',
    emailEnvoi: "Votre bilan est en cours d'envoi.",
    /** Fin rangée sur l'appareil faute de connexion (audit 03/11, FRONT-11). */
    emailFile: "Votre bilan n'est pas encore parti.",
    emailRefus: "Votre adresse n'a pas pu être enregistrée.",
    spams: 'Pensez à vérifier vos spams si vous ne trouvez pas le message.',
    enAttente:
      'Votre bilan est conservé sur cet appareil. Revenez sur cette page avec une connexion pour le transmettre. Il vous sera ensuite envoyé par email.',
    demande: 'Choisissez le créneau qui vous convient pour mettre des mots sur ce qui se rejoue.',
    bouton: 'Réserver mon appel de 30 minutes',
    sousBouton: 'Offert, 30 minutes, en visio ou par téléphone : vous racontez, Cyrille nomme le mécanisme.',
    pied: "Comprendre l'autre, vous savez déjà le faire. Se détendre dans son corps s'apprend par l'expérience, pas par l'explication.",
    recommencer: 'Recommencer le bilan',
  },
  /** Seconde proposition, quand la case des emails est restée vide (même règle que le Test). */
  suite: {
    phrase:
      "Voulez-vous recevoir la suite ? Les textes de Cyrille Novou sur la reconstruction après une relation d'emprise, ses séances guidées et ses propositions d'accompagnement.",
    bouton: 'Oui, je veux la suite',
    mention: 'Désinscription en un clic, en bas de chaque email.',
    merci: "C'est noté : la suite arrive dans votre email.",
    erreur: "L'inscription n'a pas pu être enregistrée. Cliquez de nouveau dans un instant.",
  },
  /** Remplace l'appel quand la réponse à la question de sécurité est « Oui ». */
  urgence: {
    titre: 'Votre sécurité passe avant tout le reste.',
    lignes: [
      'En cas de danger immédiat : 17 ou 112.',
      'Si vous ne pouvez pas parler : 114, par SMS.',
      "3919 : écoute et orientation (ce n'est pas un numéro d'urgence).",
      '116 006 : aide aux victimes.',
    ],
    /** Numéro affiché → lien, pour rendre chaque numéro cliquable dans les lignes. */
    liens: { '17': 'tel:17', '112': 'tel:112', '114': 'sms:114', '3919': 'tel:3919', '116 006': 'tel:116006' } as Record<string, string>,
  },
} as const
