// Données des 4 profils + textes par intensité.
// Généré depuis docs/PROFILS_RESULTATS_TEXTES.md — ne pas modifier à la main.
// Re-génération via scripts/parse_profils.py.

import type { CtaParStatut, Profil, StatutLivre } from '../domain/types'

export const profils: Profil[] = [
  {
    id: 'mendiant',
    nom: `MENDIANT DE LUXE`,
    icone: `Couronne fissurée (Lucide React \`Crown\`)`,
    ambassadeur: `Vincent`,
    descriptionBase: `Vous brillez. Et vous vous sentez vide.

Vous performez, vous excellez, vous séduisez. Votre stratégie tient en une phrase : si je suis parfait, on ne m'abandonnera pas. Si je brille assez fort, on me gardera.

Seulement l'amour qu'on vous donne n'entre pas. Vous le voyez, vous l'entendez, vous ne le ressentez pas. Au fond, vous êtes convaincu que l'amour se mérite, alors qu'il se reçoit. Et recevoir, justement, est la seule chose que votre corps n'a jamais apprise. On vous offre un cadeau, vous remerciez et vous vous sentez mal. On vous propose de l'aide, vous refusez. On vous complimente, vous démentez. « C'est rien. » « J'ai eu de la chance. » « N'importe qui aurait fait pareil. »

Vous avez appris à ne rien laisser entrer. Dans votre enfance, une information s'est inscrite, définitive : je ne mérite pas. Pas de recevoir, pas d'être aidé, pas d'être aimé pour ce que vous êtes. Alors vous donnez, vous performez, vous accumulez au-dehors les preuves d'une valeur que vous ne sentez pas au-dedans. Et quand l'amour se présente, votre corps en barre l'entrée. La porte est fermée de l'intérieur.

Recevoir reste votre seul interdit.`,
    septSymptomes: [
      `**La quête de regard.** Vous mesurez votre valeur au nombre de têtes qui se tournent quand vous entrez dans une pièce.`,
      `**La honte de soi.** Quand le regard manque, l'effondrement intérieur est immédiat. Comme si vous n'existiez plus.`,
      `**La comparaison toxique.** Vous scannez en permanence. Lui est plus brillant. Elle est plus aimée. Vous perdez à chaque fois.`,
      `**L'incompréhension.** Vous brillez fort, mais personne ne voit qui vous êtes au fond. Vous avez fini par ne plus essayer.`,
      `**L'auto-effacement masqué.** Sous la performance, il y a un enfant qui ne sait pas demander, ni recevoir, ni reposer.`,
      `**La perte de contrôle.** Quand quelque chose vous échappe (un échec, une critique, un silence), tout l'édifice vacille.`,
      `**L'incapacité à s'affirmer.** Vous brillez ou vous explosez. Vous ne savez pas dire calmement "j'ai besoin de quelque chose" ou "ça ne me va pas".`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Mendiant existe en vous, mais il reste pour l'instant gérable. Vous performez, vous brillez, et la fatigue s'installe doucement sans encore vous abattre. Vous reconnaissez la mécanique, vous la nommez, vous la voyez à l'œuvre. C'est précieux. C'est le bon moment pour agir, avant que la spirale ne se referme.`,
      modere: `Le schéma Mendiant tourne en boucle dans votre vie. Vous donnez beaucoup, vous donnez bien, et vous récoltez de moins en moins. La fatigue est devenue compagne. Les compliments ne tiennent plus la distance. Vous sentez que la performance ne suffit plus à colmater ce qui vous manque au fond. Le moment est venu de ralentir et de descendre dans le corps.`,
      profond: `Le schéma Mendiant a pris toute la place. Vous ne savez plus exister sans performer. La voix qui répète "pas à la hauteur" tourne en boucle. L'effondrement et le sentiment d'imposture vous talonnent. Cette intensité demande un accompagnement sérieux et encadré. Pas une lecture rapide. Un vrai travail corporel encadré, parce que la tête à elle seule ne fera pas le chemin.`,
    },
  },
  {
    id: 'sauveur',
    nom: `SAUVEUR ÉPUISÉ`,
    icone: `Cape déchirée (Lucide React \`Shield\`)`,
    ambassadeur: `Damien`,
    descriptionBase: `Vous sauvez tout le monde. Et personne ne vous sauve.

Vous donnez, vous aidez, vous assumez. Votre stratégie est celle de l'utilité : si je suis indispensable, on ne m'abandonnera pas. Si l'on a besoin de moi, on me garde. Mais le don sans retour appelle son contraire avec une régularité mécanique, et celui qui donne sans compter attire toujours celui qui prend sans rendre.

Vous dites oui quand vous pensez non. Vous souriez quand vous voudriez pleurer. Vous secourez quand c'est vous qu'il faudrait secourir. Et vous appelez cela de l'amour.

Vous avez peut-être derrière vous des années à comprendre pour quelle bonne raison. Un parent émotionnellement absent, une enfance entière passée à tenter de le rendre heureux, et le même geste répété, devenu adulte, avec chaque personne rencontrée. Vous avez tout compris. Et vous continuez.

Car le Sauveur Épuisé est un mendiant déguisé en héros. Il donne pour recevoir. Et le jour où il n'a plus rien à donner, il se retrouve seul avec sa propre tristesse, celle qu'il a prise en charge pour tous, sauf pour lui.

Votre valeur ne dépend pas de votre utilité. Mais votre corps n'a jamais appris à le savoir.`,
    septSymptomes: [
      `**La quête de regard.** Vous cherchez à être bien vu, considéré, reconnu pour tout ce que vous faites pour les autres.`,
      `**La honte de soi.** Quand vous ne donnez pas, vous ne valez plus rien à vos propres yeux.`,
      `**La comparaison toxique.** Vous vous comparez à des gens qui semblent recevoir naturellement, et vous vous sentez minuscule.`,
      `**L'incompréhension.** Vous donnez tellement, et personne ne semble voir ce que vous portez. Vous avez arrêté d'expliquer.`,
      `**L'auto-effacement.** Vous occupez la place de tous les autres, jamais la vôtre.`,
      `**La perte de contrôle.** Quand quelqu'un que vous avez sauvé vous lâche ou vous trahit, tout s'effondre d'un coup.`,
      `**L'incapacité à s'affirmer.** Soit vous vous écrasez et vous donnez encore plus, soit vous explosez et vous regrettez.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Sauveur s'active dans votre vie, sans avoir encore tout pris. Vous donnez beaucoup, vous le savez, et vous savez aussi vous arrêter de temps en temps. La fatigue est présente mais récupérable. C'est le bon moment pour comprendre la mécanique avant qu'elle ne se cristallise. Le corps est encore disponible pour apprendre à recevoir.`,
      modere: `Le schéma Sauveur structure désormais une grande partie de votre vie. Vous donnez par réflexe, sans même réaliser que vous le faites. La fatigue est chronique. Vous portez plusieurs personnes à bout de bras, et personne ne porte la vôtre. Le moment est venu de mettre des mots et un cadre sur ce qui se joue, parce que la spirale s'accélère.`,
      profond: `Le schéma Sauveur a colonisé votre identité. Vous ne savez plus exister sans aider. L'épuisement a pris le dessus, parfois jusqu'à l'effondrement. Vous donnez avec une rage cachée et vous sentez monter une amertume que vous n'osez pas nommer. Cette intensité demande un travail sérieux et corporel, parce qu'à ce stade, la tête a tout compris depuis longtemps. Et rien n'a changé.`,
    },
  },
  {
    id: 'controleur',
    nom: `CONTRÔLEUR ANXIEUX`,
    icone: `Tour de surveillance (Lucide React \`Eye\`)`,
    ambassadeur: `Sébastien`,
    descriptionBase: `Plus vous contrôlez, plus vous avez peur.

Vous surveillez, vous anticipez, vous vérifiez. Votre stratégie : tout prévoir pour que rien ne vous surprenne. Sauf que le contrôle est un cercle, et il se referme sur vous. Plus vous contrôlez, plus la peur monte. Plus la peur monte, plus vous contrôlez. Le danger que vous guettez n'est pourtant pas devant vous. Il est derrière, dans des mémoires d'enfance que vous prenez pour le présent.

L'anxiété vous sert d'écran de fumée. Pour ne pas être triste, pour ne pas être en colère, vous avez peur, vous stressez. Votre système nerveux préfère encore l'anxiété à la vérité, parce que la vérité, dessous, fait bien plus mal.

Alors vous voulez débattre, argumenter, démontrer. Tout plutôt que ressentir. Parce que ressentir revient à lâcher le contrôle, et que lâcher le contrôle, dans votre corps, veut dire mourir.

Vous vous croyez victime de ce qui vous arrive. La vérité est plus dure à tenir. Vous le faites arriver. Pour ne pas subir, vous devenez l'agresseur que vous fuyez, bourreau et victime dans le même corps, par le même geste. Le triangle se referme sur vous. Et voilà des années que vous tournez dedans sans en voir les murs.`,
    septSymptomes: [
      `**La quête de regard.** Vous scrutez en permanence le moindre signe de désengagement chez l'autre.`,
      `**La honte de soi.** Quand vous perdez le contrôle, vous vous sentez vulnérable, exposé, indigne.`,
      `**La comparaison toxique.** Vous comparez votre couple, votre famille, votre vie à celles des autres en permanence, à la recherche du défaut.`,
      `**L'incompréhension.** Vous expliquez et ré-expliquez, et l'autre ne comprend toujours pas. C'est insupportable.`,
      `**L'auto-effacement.** Sous l'agressivité du contrôle, il y a un enfant terrifié qui n'existe que dans la maîtrise.`,
      `**La perte de contrôle.** Le symptôme central. Tout vous échappe en permanence, malgré tous vos efforts.`,
      `**L'incapacité à s'affirmer.** Soit vous attaquez, soit vous explosez. Vous ne savez pas formuler "j'ai peur" ou "j'ai besoin de toi" sans hostilité.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Contrôleur s'invite dans votre vie, sans encore avoir étouffé vos relations. Vous savez que vous serrez parfois trop fort, et vous savez vous reprendre. L'anxiété est là, mais récupérable. C'est le bon moment pour comprendre d'où elle vient, avant qu'elle ne s'incruste plus profondément dans le corps.`,
      modere: `Le schéma Contrôleur règle désormais une grande partie de votre quotidien. L'anticipation est devenue automatique. Vous fatiguez votre entourage et vous fatiguez vous-même. La tension corporelle est constante. Le moment est venu de regarder en face ce qui se cache sous le contrôle, parce que la fatigue va finir par avoir le dernier mot.`,
      profond: `Le schéma Contrôleur a pris la commande de votre vie entière. L'anxiété est permanente, le corps est en alerte rouge depuis trop longtemps, le sommeil ne vous répare plus. Vos relations ont commencé à se vider autour de vous. Cette intensité demande un travail corporel encadré, parce que la pensée seule ne désarme pas le système nerveux. La tête comprend. Le corps répare.`,
    },
  },
  {
    id: 'fantome',
    nom: `FANTÔME RELATIONNEL`,
    icone: `Silhouette qui s'efface (SVG custom ou Lucide React \`User\` à 50% opacity)`,
    ambassadeur: `Sylvie (fil rouge du livre)`,
    descriptionBase: `Vous partez avant qu'on vous quitte.

Vous fuyez. Que ça devienne sérieux, vous étouffez. Que l'autre s'approche, vous reculez. Votre stratégie : partir le premier, pour que l'abandon, au moins, vienne de vous. Ce n'est pas une liberté. C'est une prison, celle de la fuite. Présent de corps, absent d'âme, vous gardez au-dedans un territoire que personne n'a le droit de toucher, parce que la dernière fois qu'on l'a touché, la douleur a été trop grande.

Vous quittez quelqu'un un matin et vous vous retrouvez en couple le soir même, avec un autre. Rester seul, ne serait-ce qu'une nuit, vous terrorise. Partir, revenir, repartir. Car le Fantôme ne fuit pas une personne. Il fuit ce qu'il ressent quand il se retrouve seul avec lui-même.

Ou bien vous restez. Avec des partenaires qui vous rabaissent, qui vous font souffrir, et vous restez quand même. Pour quelle bonne raison ? Parce que vous y gagnez quelque chose, en secret. Souvent, de rester petit. De ne pas grandir. De ne pas déranger un parent ancien qui n'aurait pas supporté votre élan.

Petit, vous avez appris à lire le visage d'un parent avant d'apprendre à lire les mots. Prendre de la place, c'était risquer de perdre l'amour. Alors vous avez choisi, sans le savoir, des liens qui vous maintiennent petit.`,
    septSymptomes: [
      `**La quête de regard.** Vous le fuyez et vous le cherchez en même temps. Vous voulez être vu sans être exposé.`,
      `**La honte de soi.** Vous croyez ne pas avoir le droit d'occuper la place. De déranger. D'exister bruyamment.`,
      `**La comparaison toxique.** Tous les autres semblent savoir comment être en relation. Vous, non.`,
      `**L'incompréhension.** Vous avez arrêté d'essayer de vous faire comprendre. De toute façon, ça ne sert à rien.`,
      `**L'auto-effacement.** Le symptôme central de votre profil. Vous vivez à travers une vitre.`,
      `**La perte de contrôle.** Vous croyez maîtriser en partant. En réalité, c'est l'évitement qui vous mène.`,
      `**L'incapacité à s'affirmer.** Vous ne dites ni oui ni non. Vous disparaissez.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Fantôme s'active dans votre vie, sans encore avoir éteint toute vie relationnelle. Vous fuyez parfois, et vous arrivez aussi à rester par moments. Le repli est encore réversible. C'est le bon moment pour comprendre la mécanique avant que la fuite ne devienne automatique. Sylvie a connu ce stade. Elle l'a traversé.`,
      modere: `Le schéma Fantôme structure une grande partie de vos relations. Vous savez que vous fuyez, vous le voyez, et vous n'arrivez plus à vous arrêter. L'isolement s'installe doucement. Le sentiment de vivre derrière une vitre devient familier. Le moment est venu de regarder en face d'où vient cette impulsion à disparaître, parce qu'elle vous coupe désormais de votre propre vie.`,
      profond: `Le schéma Fantôme a pris toute la place. Vous avez sans doute déjà tout fui, plusieurs fois. Vous êtes seul depuis longtemps, ou vous êtes physiquement présent dans une relation où votre âme s'est absentée. La sensation d'être un fantôme dans votre propre vie est devenue permanente. Cette intensité demande un travail corporel encadré, parce qu'à ce stade, lire ne suffit plus. Sylvie a été là. Elle a fui le travail pendant 18 mois. Elle est revenue. Sa vie a changé. La vôtre peut changer aussi.`,
    },
  },
]

export const ctaParStatut: Record<StatutLivre, CtaParStatut> = {
  pas_lu: {
    amorce: `Vous venez de découvrir votre profil. Vous reconnaissez le mécanisme. C'est un premier pas.

Vous recevez maintenant par email **vos 20 séances audio guidées**, calibrées sur votre profil. Vous commencez ce soir, à votre rythme. Le corps se met au travail là où la lecture seule ne va pas.

Et si vous voulez aller plus loin, vous réservez un appel de qualification de 45 minutes pour évaluer ensemble votre place dans le programme Régénération.

La tête comprend. Le corps répare.`,
    ctaPrincipal: { texte: `Ouvrir mon email et récupérer mes 20 séances`, url: `#` },
    ctaSecondaire: { texte: `Réserver un appel de qualification pour Régénération`, url: `https://cyrillenovou-45mn.youcanbook.me/` },
  },
  lu_partiel: {
    amorce: `Votre profil est maintenant identifié. Votre carte intérieure se précise.

Vous recevez par email **vos 20 séances audio guidées** calibrées sur votre profil. Elles vous accompagnent dès ce soir. Le corps se met au travail là où comprendre seul ne va pas.

Si l'accompagnement corporel devient évident, vous réservez un appel de qualification de 45 minutes pour évaluer ensemble votre place dans le programme Régénération.`,
    ctaPrincipal: { texte: `Ouvrir mon email et récupérer mes 20 séances`, url: `#` },
    ctaSecondaire: { texte: `Réserver un appel de qualification pour Régénération`, url: `https://cyrillenovou-45mn.youcanbook.me/` },
  },
  lu_complet: {
    amorce: `Vous avez identifié votre schéma. Vous l'avez sans doute déjà vu agir dans plusieurs zones de votre vie.

Vous savez aussi maintenant que comprendre ne suffit pas.

Le travail réel commence dans le corps, dans un cadre encadré, avec un accompagnant. Le programme Régénération existe pour ça. Trois jours résidentiels, sept places, une transformation incarnée.

Si votre intensité est modérée ou profonde, et si vous êtes prêt à agir, c'est le pas suivant.`,
    ctaPrincipal: { texte: `Réserver un appel de qualification pour Régénération`, url: `https://cyrillenovou-45mn.youcanbook.me/` },
    ctaSecondaire: { texte: `Rejoindre la communauté Souverain au Quotidien`, url: `https://www.souverainauquotidien.com` },
  },
}
