// Données des 30 questions du test de survie affective.
// Généré depuis docs/QUESTIONS_30_SCORING.md — ne pas modifier à la main.
// Toute mise à jour passe par le doc puis re-génération via /tmp/parse_questions.py.

import type {
  Question,
  QuestionContexte,
  QuestionIntensite,
  QuestionTypage,
} from '../domain/types'

export const questionsTypage: QuestionTypage[] = [
  {
    id: 1,
    type: 'typage',
    enonce: "Votre partenaire ne répond pas à votre message depuis 2 heures. Votre première réaction.",
    options: [
      { id: "A", texte: "Vous lui en envoyez un autre, puis encore un, vous voulez savoir", profil: 'controleur' },
      { id: "B", texte: "Vous arrêtez aussi de répondre, qu'il sente votre absence", profil: 'fantome' },
      { id: "C", texte: "Vous vous demandez ce que vous avez fait, vous préparez quelque chose qui lui fera plaisir", profil: 'sauveur' },
      { id: "D", texte: "Vous postez quelque chose de brillant ailleurs, qu'il voie ce qu'il rate", profil: 'mendiant' },
    ],
  },
  {
    id: 2,
    type: 'typage',
    enonce: "Au début d'une nouvelle relation amoureuse.",
    options: [
      { id: "A", texte: "Vous voulez devenir sa meilleure version possible, vous performez", profil: 'mendiant' },
      { id: "B", texte: "Vous anticipez ses besoins, vous voulez qu'il se sente bien chez vous", profil: 'sauveur' },
      { id: "C", texte: "Vous vérifiez régulièrement que tout va bien, vous voulez de la clarté", profil: 'controleur' },
      { id: "D", texte: "Vous gardez une distance, vous ne vous emballez pas trop tôt", profil: 'fantome' },
    ],
  },
  {
    id: 3,
    type: 'typage',
    enonce: "Quelqu'un vous fait un compliment sincère et appuyé.",
    options: [
      { id: "A", texte: "Vous changez de sujet, c'est inconfortable", profil: 'fantome' },
      { id: "B", texte: "Vous redoublez d'efforts, vous voulez le mériter encore plus", profil: 'mendiant' },
      { id: "C", texte: "Vous le retournez sur l'autre, qu'il en reçoive aussi", profil: 'sauveur' },
      { id: "D", texte: "Vous cherchez ce qu'il y a derrière, l'arrière-pensée", profil: 'controleur' },
    ],
  },
  {
    id: 4,
    type: 'typage',
    enonce: "L'autre commence à prendre ses distances ou semble distant.",
    options: [
      { id: "A", texte: "Vous l'interrogez, vous fouillez, vous voulez comprendre", profil: 'controleur' },
      { id: "B", texte: "Vous redoublez d'attention et de séduction", profil: 'mendiant' },
      { id: "C", texte: "Vous cherchez ce que vous avez fait, ce que vous pouvez réparer", profil: 'sauveur' },
      { id: "D", texte: "Vous prenez vos distances en premier, c'est plus simple", profil: 'fantome' },
    ],
  },
  {
    id: 5,
    type: 'typage',
    enonce: "On vous adresse une critique sur votre comportement.",
    options: [
      { id: "A", texte: "Vous reconnaissez tout, vous présentez vos excuses, même au-delà de la critique", profil: 'sauveur' },
      { id: "B", texte: "Vous expliquez tout ce que vous avez fait de bien à côté", profil: 'mendiant' },
      { id: "C", texte: "Vous contre-attaquez en pointant ses propres défauts", profil: 'controleur' },
      { id: "D", texte: "Vous vous fermez, vous coupez le contact, vous partez", profil: 'fantome' },
    ],
  },
  {
    id: 6,
    type: 'typage',
    enonce: "Quand vous avez besoin d'aide pour quelque chose d'important.",
    options: [
      { id: "A", texte: "Inenvisageable, vous n'aimez pas montrer la moindre faiblesse", profil: 'mendiant' },
      { id: "B", texte: "Vous préférez aider plutôt qu'être aidé, vous trouvez une autre voie", profil: 'sauveur' },
      { id: "C", texte: "Vous demandez mais vous précisez exactement ce qu'il faut faire et comment", profil: 'controleur' },
      { id: "D", texte: "Vous vous débrouillez seul, vous n'aimez pas devoir quelque chose à quelqu'un", profil: 'fantome' },
    ],
  },
  {
    id: 7,
    type: 'typage',
    enonce: "Dans un groupe d'amis ou de collègues, vous êtes plutôt.",
    options: [
      { id: "A", texte: "Au centre, vous animez, vous racontez, vous brillez", profil: 'mendiant' },
      { id: "B", texte: "À l'écoute de ceux qui semblent moins bien, vous prenez soin", profil: 'sauveur' },
      { id: "C", texte: "Stratégique, vous décodez les enjeux, vous lisez les rapports de force", profil: 'controleur' },
      { id: "D", texte: "En retrait, vous observez, vous parlez peu", profil: 'fantome' },
    ],
  },
  {
    id: 8,
    type: 'typage',
    enonce: "Quand vous tombez amoureux de quelqu'un.",
    options: [
      { id: "A", texte: "Vous voulez être sa plus belle histoire d'amour", profil: 'mendiant' },
      { id: "B", texte: "Vous voulez devenir sa personne indispensable", profil: 'sauveur' },
      { id: "C", texte: "Vous voulez tout savoir de sa vie, son passé, ses ex", profil: 'controleur' },
      { id: "D", texte: "Vous freinez, la peur monte, vous fuyez à demi", profil: 'fantome' },
    ],
  },
  {
    id: 9,
    type: 'typage',
    enonce: "Le silence dans une conversation avec quelqu'un de proche.",
    options: [
      { id: "A", texte: "Vous le remplissez vite avec une histoire qui captive", profil: 'mendiant' },
      { id: "B", texte: "Vous demandez à l'autre si tout va bien", profil: 'sauveur' },
      { id: "C", texte: "Vous le trouvez inconfortable, vous voulez savoir ce qu'il pense", profil: 'controleur' },
      { id: "D", texte: "Vous l'appréciez, vous y êtes à l'aise", profil: 'fantome' },
    ],
  },
  {
    id: 10,
    type: 'typage',
    enonce: "Quand une relation amoureuse se termine.",
    options: [
      { id: "A", texte: "Vous coupez net, vous disparaissez, c'est plus propre", profil: 'fantome' },
      { id: "B", texte: "Vous voulez prouver que vous valiez mieux, vous transformez la rupture en victoire", profil: 'mendiant' },
      { id: "C", texte: "Vous gardez le contact, vous restez ami, on ne sait jamais", profil: 'sauveur' },
      { id: "D", texte: "Vous voulez comprendre exactement ce qui n'a pas marché, point par point", profil: 'controleur' },
    ],
  },
  {
    id: 11,
    type: 'typage',
    enonce: "Votre plus grande peur en relation.",
    options: [
      { id: "A", texte: "Ne pas être à la hauteur", profil: 'mendiant' },
      { id: "B", texte: "Ne plus être indispensable", profil: 'sauveur' },
      { id: "C", texte: "Perdre le contrôle de la situation", profil: 'controleur' },
      { id: "D", texte: "Souffrir si vous vous attachez profondément", profil: 'fantome' },
    ],
  },
  {
    id: 12,
    type: 'typage',
    enonce: "Votre comportement quand vous êtes blessé par quelque chose dans la relation.",
    options: [
      { id: "A", texte: "Vous redoublez de performance, vous brillez plus fort, vous masquez", profil: 'mendiant' },
      { id: "B", texte: "Vous continuez à donner, vous vous oubliez encore plus", profil: 'sauveur' },
      { id: "C", texte: "Vous demandez des comptes, vous attaquez, vous mettez les choses au clair", profil: 'controleur' },
      { id: "D", texte: "Vous vous coupez de vos émotions, vous mettez à distance", profil: 'fantome' },
    ],
  },
  {
    id: 13,
    type: 'typage',
    enonce: "Le besoin que vous avez le plus de mal à exprimer.",
    options: [
      { id: "A", texte: "Demander de l'aide, paraître en faiblesse", profil: 'mendiant' },
      { id: "B", texte: "Demander à recevoir, juste pour vous", profil: 'sauveur' },
      { id: "C", texte: "Lâcher prise, faire confiance, ne pas tout maîtriser", profil: 'controleur' },
      { id: "D", texte: "Demander qu'on reste, qu'on ne parte pas", profil: 'fantome' },
    ],
  },
  {
    id: 14,
    type: 'typage',
    enonce: "Quand vous êtes seul un dimanche soir.",
    options: [
      { id: "A", texte: "Vous trouvez vite quelque chose de productif à faire, surtout pas vide", profil: 'mendiant' },
      { id: "B", texte: "Vous appelez quelqu'un pour prendre de ses nouvelles", profil: 'sauveur' },
      { id: "C", texte: "Vous planifiez votre semaine, vous reprenez le contrôle", profil: 'controleur' },
      { id: "D", texte: "Vous appréciez ce moment, vous le protégez même", profil: 'fantome' },
    ],
  },
  {
    id: 15,
    type: 'typage',
    enonce: "Votre rapport à l'engagement amoureux long terme.",
    options: [
      { id: "A", texte: "Vous voulez la reconnaissance et le statut qu'il vous apporte", profil: 'mendiant' },
      { id: "B", texte: "Vous voulez le cadre qui vous permet de donner pleinement", profil: 'sauveur' },
      { id: "C", texte: "Vous voulez la sécurité et la prévisibilité qu'il garantit", profil: 'controleur' },
      { id: "D", texte: "Vous le craignez, il vous enferme, il vous étouffe à l'avance", profil: 'fantome' },
    ],
  },
  {
    id: 16,
    type: 'typage',
    enonce: "Quand la peur monte en vous au sein d'une relation.",
    options: [
      { id: "A", texte: "Vous faites comme si tout allait bien, vous brillez plus fort", profil: 'mendiant' },
      { id: "B", texte: "Vous redoublez d'attention pour l'autre, vous oubliez la peur", profil: 'sauveur' },
      { id: "C", texte: "Vous serrez, vous vérifiez, vous contrôlez encore plus", profil: 'controleur' },
      { id: "D", texte: "Vous vous éloignez physiquement ou émotionnellement", profil: 'fantome' },
    ],
  },
  {
    id: 17,
    type: 'typage',
    enonce: "Recevoir un cadeau ou une attention sans rien avoir donné.",
    options: [
      { id: "A", texte: "Vous voulez offrir l'équivalent ou plus, vite", profil: 'mendiant' },
      { id: "B", texte: "Vous êtes touché, vous voulez le rendre rapidement", profil: 'sauveur' },
      { id: "C", texte: "Vous cherchez l'intention derrière, qu'attend-il en retour", profil: 'controleur' },
      { id: "D", texte: "Vous êtes mal à l'aise, vous minimisez, vous dites que ce n'était pas la peine", profil: 'fantome' },
    ],
  },
  {
    id: 18,
    type: 'typage',
    enonce: "Votre voix dans un conflit important avec un proche.",
    options: [
      { id: "A", texte: "Vous argumentez avec brio, vous voulez convaincre", profil: 'mendiant' },
      { id: "B", texte: "Vous cherchez le compromis qui apaise tout le monde", profil: 'sauveur' },
      { id: "C", texte: "Vous attaquez, vous prouvez que vous avez raison", profil: 'controleur' },
      { id: "D", texte: "Vous vous taisez, vous laissez passer, vous fuyez le conflit", profil: 'fantome' },
    ],
  },
  {
    id: 19,
    type: 'typage',
    enonce: "Vos histoires d'amour répètent toujours le même schéma.",
    options: [
      { id: "A", texte: "On vous quitte malgré vos efforts, vos sacrifices, votre éclat", profil: 'mendiant' },
      { id: "B", texte: "Vous donnez tout, on vous lâche, vous vous épuisez", profil: 'sauveur' },
      { id: "C", texte: "Vous étouffez l'autre malgré vous, il finit par fuir", profil: 'controleur' },
      { id: "D", texte: "Vous partez avant d'être quitté, encore une fois", profil: 'fantome' },
    ],
  },
  {
    id: 20,
    type: 'typage',
    enonce: "Ce qui vous fait le plus souffrir dans votre vie aujourd'hui.",
    options: [
      { id: "A", texte: "Cette voix intérieure qui répète \"pas à la hauteur\", malgré toutes les preuves du contraire", profil: 'mendiant' },
      { id: "B", texte: "Cet épuisement à donner sans recevoir en retour", profil: 'sauveur' },
      { id: "C", texte: "Cette anxiété permanente, cette tension dans le corps que vous ne maîtrisez pas", profil: 'controleur' },
      { id: "D", texte: "Cette sensation d'être seul même entouré, cette impression d'être un fantôme", profil: 'fantome' },
    ],
  },
]

export const questionsIntensite: QuestionIntensite[] = [
  {
    id: 21,
    type: 'intensite',
    enonce: "Depuis combien de temps reconnaissez-vous ce schéma dans vos relations ?",
    options: [
      { valeur: 1, texte: "Depuis quelques mois seulement" },
      { valeur: 2, texte: "Depuis 1 ou 2 ans" },
      { valeur: 3, texte: "Depuis environ 5 ans" },
      { valeur: 4, texte: "Depuis 10 ans ou plus" },
      { valeur: 5, texte: "Depuis aussi loin que je me souvienne" },
    ],
  },
  {
    id: 22,
    type: 'intensite',
    enonce: "À quelle fréquence ce schéma s'active-t-il dans votre vie ?",
    options: [
      { valeur: 1, texte: "Cela m'arrive parfois, mais je gère" },
      { valeur: 2, texte: "Cela revient régulièrement, plusieurs fois par mois" },
      { valeur: 3, texte: "C'est presque tous les jours" },
      { valeur: 4, texte: "Cela occupe la majorité de mes pensées" },
      { valeur: 5, texte: "Cela m'empêche de fonctionner normalement" },
    ],
  },
  {
    id: 23,
    type: 'intensite',
    enonce: "Quel est l'impact corporel de ce schéma sur vous ?",
    options: [
      { valeur: 1, texte: "Aucun symptôme physique notable" },
      { valeur: 2, texte: "Parfois fatigue, tension, ou insomnie passagère" },
      { valeur: 3, texte: "Troubles du sommeil ou de l'appétit récurrents" },
      { valeur: 4, texte: "Symptômes physiques qui m'inquiètent (gorge serrée, douleur thoracique, vertiges)" },
      { valeur: 5, texte: "J'ai vécu des épisodes de panique, dépression ou burn-out" },
    ],
  },
  {
    id: 24,
    type: 'intensite',
    enonce: "Comment vivez-vous vos relations amoureuses actuellement ?",
    options: [
      { valeur: 1, texte: "J'ai des relations stables et nourrissantes" },
      { valeur: 2, texte: "Mes relations sont correctes mais avec des frustrations régulières" },
      { valeur: 3, texte: "Mes relations sont compliquées, je rejoue souvent les mêmes conflits" },
      { valeur: 4, texte: "Mes relations échouent toutes de la même façon" },
      { valeur: 5, texte: "Je ne suis plus capable d'être en relation, je suis seul depuis longtemps" },
    ],
  },
  {
    id: 25,
    type: 'intensite',
    enonce: "Combien de fois avez-vous tenté de changer ce schéma ?",
    options: [
      { valeur: 1, texte: "C'est ma première démarche réelle de transformation" },
      { valeur: 2, texte: "J'ai essayé 1 ou 2 fois, sans aller au bout" },
      { valeur: 3, texte: "J'ai fait plusieurs thérapies ou accompagnements" },
      { valeur: 4, texte: "J'ai tout essayé, rien n'a fonctionné durablement" },
      { valeur: 5, texte: "J'ai abandonné l'idée de pouvoir changer un jour" },
    ],
  },
  {
    id: 26,
    type: 'intensite',
    enonce: "Quelle urgence ressentez-vous aujourd'hui à transformer ce schéma ?",
    options: [
      { valeur: 1, texte: "Je veux comprendre, sans pression" },
      { valeur: 2, texte: "Je sens que je dois bouger, sans urgence absolue" },
      { valeur: 3, texte: "Je sens qu'il est temps maintenant" },
      { valeur: 4, texte: "J'ai l'impression que c'est ma dernière chance de m'en sortir" },
      { valeur: 5, texte: "Je suis au pied du mur, je ne peux plus continuer comme ça" },
    ],
  },
]

export const questionsContexte: QuestionContexte[] = [
  {
    id: 27,
    type: 'contexte',
    enonce: "Avez-vous déjà lu le livre \"Vous avez tout compris. Rien n'a changé.\" ?",
    champCible: 'statutLivre',
    options: [
      { id: "A", texte: "Oui, je l'ai lu en entier", valeur: "lu_complet" },
      { id: "B", texte: "Oui, je suis en train de le lire", valeur: "lu_partiel" },
      { id: "C", texte: "Non, pas encore", valeur: "pas_lu" },
    ],
  },
  {
    id: 28,
    type: 'contexte',
    enonce: "Quelle est votre situation relationnelle actuelle ?",
    champCible: 'situation',
    options: [
      { id: "A", texte: "En couple stable et globalement satisfaisant", valeur: "couple_stable" },
      { id: "B", texte: "En couple compliqué ou conflictuel", valeur: "couple_difficile" },
      { id: "C", texte: "Célibataire après une rupture récente", valeur: "rupture_recente" },
      { id: "D", texte: "Célibataire depuis longtemps", valeur: "celibat_long" },
    ],
  },
  {
    id: 29,
    type: 'contexte',
    enonce: "Comment décririez-vous votre état émotionnel ce mois-ci ?",
    champCible: 'etatEmotionnel',
    options: [
      { id: "A", texte: "Globalement fonctionnel et stable", valeur: "fonctionnel" },
      { id: "B", texte: "Tendu, fatigué, sur les nerfs", valeur: "tendu" },
      { id: "C", texte: "En crise, en grande souffrance", valeur: "crise" },
      { id: "D", texte: "En reconstruction après une crise récente", valeur: "reconstruction" },
    ],
  },
  {
    id: 30,
    type: 'contexte',
    enonce: "Êtes-vous prêt à investir dans un accompagnement transformateur ?",
    champCible: 'pretAAgir',
    options: [
      { id: "A", texte: "Oui, je suis prêt à m'engager maintenant", valeur: "maintenant" },
      { id: "B", texte: "Oui, mais pas tout de suite, dans quelques semaines ou mois", valeur: "bientot" },
      { id: "C", texte: "Je veux d'abord comprendre, lire, m'informer", valeur: "comprendre_dabord" },
      { id: "D", texte: "Je ne sais pas encore", valeur: "incertain" },
    ],
  },
]

export const questions: Question[] = [
  ...questionsTypage,
  ...questionsIntensite,
  ...questionsContexte,
]
