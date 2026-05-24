// Données des 4 profils + textes par intensité.
// Généré depuis docs/PROFILS_RESULTATS_TEXTES.md — ne pas modifier à la main.
// Re-génération via scripts/parse_profils.py.

import type { CtaParStatut, Profil, StatutLivre } from '../domain/types'

export const profils: Profil[] = [
  {
    id: 'mendiant',
    nom: `MENDIANT DE LUXE`,
    icone: `Couronne fissurée (Lucide React \`Crown\`)`,
    ambassadeur: `Fabrice`,
    descriptionBase: `Vous brillez. Vous performez. Vous excellez dans tout ce que vous faites.

Mais ça ne suffit jamais.

Derrière chaque victoire, il y a cette voix qui vous dit que vous devez en faire plus. Être plus. Donner plus. Pour mériter l'amour.

Vous êtes accro au regard des autres comme un junkie à sa dose. Et c'est plus fort que vous.

Vous avez collectionné les diplômes, les performances, les compliments. Vous avez tout fait pour être à la hauteur. Et pourtant, l'angoisse revient toujours. Le sentiment d'imposture. La peur d'être démasqué.

L'amour ne se mérite pas. Il se reçoit. Mais recevoir, c'est exactement ce que vous ne savez pas faire.`,
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
    ambassadeur: `Jérémy`,
    descriptionBase: `Vous donnez. Vous aidez. Vous sauvez.

Tout le monde compte sur vous. Tout le monde sait qu'il peut s'appuyer sur vous.

Mais qui s'occupe de vous ?

Vous vous épuisez à rendre les autres heureux. Vous ravalez vos propres besoins, vous reportez vos projets, vous oubliez vos rêves. Vous attendez secrètement qu'un jour, quelqu'un fera pareil pour vous.

Ce jour ne vient pas.

Tant que vous donnez pour recevoir, vous ne recevrez jamais ce dont vous avez profondément besoin.

Vous avez peur de déranger. Tellement peur que vous avez disparu sous les besoins des autres. Et personne ne s'en est aperçu.`,
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
    ambassadeur: `Nathan`,
    descriptionBase: `Vous anticipez. Vous vérifiez. Vous contrôlez.

Si vous lâchez prise, tout pourrait s'effondrer.

L'incertitude vous fait peur. L'imprévu vous angoisse. Le silence de l'autre vous met en alerte rouge.

Alors vous serrez. Vous tenez. Vous étouffez.

Vous serrez si fort que vous repoussez ceux que vous voulez garder.

Plus vous contrôlez, plus vous repoussez les autres. Et plus vous repoussez, plus vous confirmez la peur d'être abandonné. La boucle est parfaite. Elle est aussi insupportable.

Vous croyez tenir le monde. C'est le monde qui vous tient.`,
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
    ambassadeur: `Caroline (fil rouge du livre)`,
    descriptionBase: `Vous disparaissez. Vous vous effacez. Vous fuyez.

Dès que ça devient trop intense, vous prenez la tangente.

Pas par manque d'amour. Par peur de le perdre.

Vous partez avant qu'on vous quitte. Vous gardez vos distances avant qu'on vous blesse. Vous coupez avant qu'on coupe.

En fuyant la douleur, vous fuyez aussi l'amour.

Vous avez tellement peur de déranger que vous avez disparu. Et personne ne s'en est aperçu. C'est exactement ça le drame. Personne ne vous a cherché parce que vous aviez tout fait pour qu'on ne vous trouve pas.

Vous avez l'impression d'être un fantôme dans votre propre vie. Présent et absent à la fois.`,
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
      surface: `Le schéma Fantôme s'active dans votre vie, sans encore avoir éteint toute vie relationnelle. Vous fuyez parfois, et vous arrivez aussi à rester par moments. Le repli est encore réversible. C'est le bon moment pour comprendre la mécanique avant que la fuite ne devienne automatique. Caroline a connu ce stade. Elle l'a traversé.`,
      modere: `Le schéma Fantôme structure une grande partie de vos relations. Vous savez que vous fuyez, vous le voyez, et vous n'arrivez plus à vous arrêter. L'isolement s'installe doucement. Le sentiment de vivre derrière une vitre devient familier. Le moment est venu de regarder en face d'où vient cette impulsion à disparaître, parce qu'elle vous coupe désormais de votre propre vie.`,
      profond: `Le schéma Fantôme a pris toute la place. Vous avez sans doute déjà tout fui, plusieurs fois. Vous êtes seul depuis longtemps, ou vous êtes physiquement présent dans une relation où votre âme s'est absentée. La sensation d'être un fantôme dans votre propre vie est devenue permanente. Cette intensité demande un travail corporel encadré, parce qu'à ce stade, lire ne suffit plus. Caroline a été là. Elle a fui le travail pendant 18 mois. Elle est revenue. Sa vie a changé. La vôtre peut changer aussi.`,
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
