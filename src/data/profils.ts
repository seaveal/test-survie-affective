// Données des 4 profils + textes par intensité.
// Généré depuis docs/PROFILS_RESULTATS_TEXTES.md — ne pas modifier à la main.
// Re-génération via scripts/parse_profils.py.

import type { CtaParStatut, Profil, StatutLivre } from '../domain/types'

export const profils: Profil[] = [
  {
    id: 'mendiant',
    nom: `MENDIANT DE LUXE`,
    icone: `Couronne fissurée (Lucide React \`Crown\`)`,
    ambassadeur: `Emeric`,
    descriptionBase: `Vous brillez. Et vous vous sentez vide.

Vous performez, vous excellez, vous séduisez. Votre stratégie tient en une phrase : si je suis parfait, on ne m'abandonnera pas. Si je brille assez fort, on me gardera. Alors vous en donnez toujours plus, et vous accumulez au-dehors les preuves d'une valeur que vous ne sentez pas au-dedans.

Voici ce que personne ne voit. L'amour qu'on vous donne n'entre pas. Vous le voyez, vous l'entendez, vous ne le ressentez pas. On vous complimente et vous démentez : « c'est rien », « j'ai eu de la chance », « n'importe qui aurait fait pareil ». On vous offre un cadeau et vous cherchez déjà comment le rendre. On vous applaudit, quarante paires de mains dans une salle, et rien n'entre. Vous tendez la main et vous repoussez ce qu'on y dépose.

Regardez votre corps au moment exact où quelqu'un vous donne quelque chose. La gorge se ferme. Le ventre se creuse, comme un trou d'air. Recevoir, pour vous, n'est pas un plaisir. C'est un effort qui échoue.

Cet interdit a un âge. Dans votre enfance, une information s'est inscrite, définitive : je ne mérite pas. Pas de recevoir, pas d'être aidé, pas d'être aimé pour ce que vous êtes, seulement pour ce que vous produisez. Un mot a suffi. Un « et ça ? » posé sur la seule note qui dépassait pas, sur un bulletin par ailleurs parfait. Un « je compte sur toi » déposé un matin sur les épaules d'un enfant trop jeune. L'enfant n'a pas conclu « on ne m'aime pas ». Il a conclu « je sais comment faire revenir l'attention ». Et il a fait. Encore. Plus fort. Mieux. Vous faites toujours.

Aujourd'hui vous dirigez, vous réussissez, on vous cite en exemple. Et le soir, le même vide qu'à l'époque, intact. L'amour circule autour de vous comme la lumière autour d'une vitrine. Ça éclaire, ça met en valeur, ça n'entre pas. Vous ne construisez pas une carrière, vous surélevez un échafaudage, et vous vivez dessus, en sachant que chaque compliment augmente la hauteur de la chute.

Comprendre tout cela n'a rien ouvert. La porte est fermée de l'intérieur, et la poignée n'est pas dans la tête. Recevoir reste votre seul interdit. L'amour ne se mérite pas. Il se reçoit. Et recevoir, c'est la seule chose que votre corps n'a jamais apprise.`,
    septSymptomes: [
      `**La quête de regard.** Vous mesurez votre valeur au nombre de têtes qui se tournent quand vous entrez dans une pièce. Le regard des autres n'est pas un plaisir, c'est votre oxygène.`,
      `**La honte de soi.** Quand le regard manque, l'effondrement est immédiat, comme si vous n'existiez plus. Et un mot que vous n'osez pas dire attend en dessous : imposteur. Chaque réussite repousse d'un jour le moment où l'on vous démasquera.`,
      `**La comparaison toxique.** Vous scannez en permanence. Lui est plus brillant. Elle est plus aimée. Vous comparez vos coulisses à la scène des autres, et vous perdez à chaque fois.`,
      `**L'incompréhension.** Vous brillez fort, mais personne ne voit qui vous êtes au fond. Vous avez tout fait pour qu'on ne vous croie pas. Alors vous avez fini par ne plus essayer, seul au milieu de gens qui vous aiment.`,
      `**L'auto-effacement masqué.** Sous la performance, il y a un enfant qui ne sait pas demander, ni recevoir, ni se reposer.`,
      `**La perte de contrôle.** Un échec, une critique, un silence, et tout l'édifice vacille pour trois jours. Vous compensez en travaillant plus.`,
      `**L'incapacité à s'affirmer.** Vous brillez ou vous explosez. Vous ne savez pas dire calmement « j'ai besoin de quelque chose » ou « ça ne me va pas ». L'alarme dans le ventre parle avant vous.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Mendiant existe en vous, mais il reste pour l'instant gérable. Vous performez, vous brillez, et la fatigue s'installe doucement sans encore vous abattre. Vous reconnaissez la mécanique, vous la nommez, vous la voyez à l'œuvre. C'est précieux. La voix qui demande « ai-je été à la hauteur ? » se manifeste par moments, sans encore commander vos journées. C'est le bon moment pour agir, avant que la spirale ne se referme.`,
      modere: `Le schéma Mendiant tourne en boucle dans votre vie. Vous donnez beaucoup, vous donnez bien, et vous récoltez de moins en moins. La fatigue est devenue une compagne. Les compliments ne tiennent plus la distance, le week-end ne répare plus, et la voix de l'audit vous réveille avant l'aube pour repasser la journée à la recherche de la faille. La performance ne suffit plus à colmater ce qui vous manque au fond. Le moment est venu de ralentir et de descendre dans le corps.`,
      profond: `Le schéma Mendiant a pris toute la place. Vous ne savez plus exister sans performer. La voix qui répète « pas à la hauteur » tourne en boucle, l'imposture vous talonne, et votre corps commence à envoyer ses factures : la mâchoire soudée au réveil, le souffle court sur le parking avant de remettre le masque, le dos qui lâche. Cette intensité demande un accompagnement sérieux et encadré. Pas une lecture rapide. Un vrai travail corporel encadré, parce que la tête à elle seule ne fera pas le chemin.`,
    },
  },
  {
    id: 'sauveur',
    nom: `SAUVEUR ÉPUISÉ`,
    icone: `Cape déchirée (Lucide React \`Shield\`)`,
    ambassadeur: `Hélène`,
    descriptionBase: `Vous sauvez tout le monde. Et personne ne vous sauve.

Vous donnez, vous aidez, vous assumez. Votre stratégie est celle de l'utilité : si je suis indispensable, on ne m'abandonnera pas. Si l'on a besoin de moi, on me garde. Alors vous dites oui quand vous pensez non. Vous souriez quand vous voudriez pleurer. Vous secourez quand c'est vous qu'il faudrait secourir. Et vous appelez cela de l'amour.

Regardez ce qui se passe une seconde avant que votre bouche dise oui. Une compression sous le sternum, une main qui appuie au creux du plexus. Votre corps sait déjà. Il connaît la différence entre un cadeau et une rançon. Vous, vous n'écoutez pas. Vous donnez comme on paie un loyer, pour avoir le droit d'habiter votre propre vie.

Et le don sans retour appelle son contraire avec une régularité mécanique. Celui qui donne sans compter attire toujours celui qui prend sans rendre. Alors ils viennent poser leurs problèmes sur votre table et repartent soulagés, et vous absorbez. « Toi ça va, tu gères. » « Qu'est-ce qu'on ferait sans toi. » Ce n'est pas un merci, c'est un contrat. Vous êtes devenu le mur porteur, et on ne demande pas à un mur porteur s'il est fatigué.

Cette place a un âge. Un parent émotionnellement absent, une enfance entière passée à tenter de le rendre heureux, un enfant de huit ans qui faisait déjà le café pour exister dans la pièce. Vous avez appris que l'amour se gagne en se rendant indispensable, et vous avez disparu sous les besoins des autres sans que personne ne s'en aperçoive. Personne ne vous a cherché. Vous aviez tout organisé pour ne jamais peser.

Vous avez peut-être derrière vous des années d'approches verbales en cabinet à comprendre tout cela. Et vous continuez. Car le Sauveur Épuisé est un mendiant déguisé en héros. Il donne pour recevoir. Et le jour où il n'a plus rien à donner, il se retrouve seul avec sa propre tristesse, celle qu'il a prise en charge pour tous, sauf pour lui.

Votre valeur ne dépend pas de votre utilité. Mais votre corps ne l'a jamais appris. Il peut l'apprendre.`,
    septSymptomes: [
      `**La quête de regard.** Vous cherchez à être bien vu, considéré, reconnu pour tout ce que vous faites pour les autres. Jamais pour ce que vous êtes quand vous ne faites rien.`,
      `**La honte de soi.** Quand vous ne donnez pas, vous ne valez plus rien à vos propres yeux. Votre disponibilité est devenue votre identité, et votre identité est devenue une file d'attente.`,
      `**La comparaison toxique.** Vous vous comparez à des gens qui semblent recevoir naturellement, sans rien avoir à payer d'abord, et vous vous sentez minuscule.`,
      `**L'incompréhension.** Vous donnez tellement, et personne ne semble voir ce que vous prenez en charge. Vous avez arrêté d'expliquer.`,
      `**L'auto-effacement.** Vous occupez la place de tous les autres, jamais la vôtre. À table, vous avez choisi la chaise du bout, côté cuisine, pour vous lever sans faire reculer personne.`,
      `**La perte de contrôle.** Quand quelqu'un que vous avez sauvé vous lâche ou vous trahit, tout s'effondre d'un coup. La colère qui déborde alors est la colère de toutes les fois où vous vous êtes tu.`,
      `**L'incapacité à s'affirmer.** Soit vous vous écrasez et vous donnez encore plus, soit vous explosez et vous le regrettez aussitôt.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Sauveur s'active dans votre vie, sans avoir encore tout pris. Vous donnez beaucoup, vous le savez, et vous savez aussi vous arrêter de temps en temps. La fatigue est présente mais récupérable. C'est le bon moment pour comprendre la mécanique avant qu'elle ne se cristallise. Le corps est encore disponible pour apprendre à recevoir, à laisser vos bras s'ouvrir quand on vous offre quelque chose, au lieu de se refermer.`,
      modere: `Le schéma Sauveur structure désormais une grande partie de votre vie. Vous donnez par réflexe, sans même réaliser que vous le faites. La fatigue est chronique. Vous prenez en charge plusieurs personnes à bout de bras, et personne ne prend soin de la vôtre. Vous montez les escaliers de votre propre maison comme un homme de soixante-dix ans. Le moment est venu de mettre des mots et un cadre sur ce qui se joue, parce que la spirale s'accélère.`,
      profond: `Le schéma Sauveur a colonisé votre identité. Vous ne savez plus exister sans aider. L'épuisement a pris le dessus, parfois jusqu'à l'effondrement. Vous donnez avec une rage cachée, et une amertume monte que vous n'osez pas nommer. La question revient à quatre heures du matin, dans le noir : le jour où je tombe, qui me ramasse ? Cette intensité demande un travail sérieux et corporel, parce qu'à ce stade, la tête a tout compris depuis longtemps. Et rien n'a changé.`,
    },
  },
  {
    id: 'controleur',
    nom: `CONTRÔLEUR ANXIEUX`,
    icone: `Tour de surveillance (Lucide React \`Eye\`)`,
    ambassadeur: `Virginie`,
    descriptionBase: `Plus vous contrôlez, plus vous avez peur.

Vous surveillez, vous anticipez, vous vérifiez. Votre stratégie tient en un réflexe : tout prévoir pour que rien ne vous surprenne. Sauf que le contrôle est un cercle, et il se referme sur vous. Plus vous contrôlez, plus la peur monte. Plus la peur monte, plus vous contrôlez. Le contrôle promet la sécurité. Il n'offre que la surveillance.

Il est 23h41 et vous relisez un mail envoyé à 18h02. Trois fois. Vous cherchez la phrase qui pourrait être mal comprise, vous la trouvez, et le ventre se noue sur un message que rien ne peut plus rattraper. À 3h03, vous êtes réveillé, la nuque en béton, le cerveau qui ouvre les dossiers un par un et déroule chaque scénario jusqu'au pire. Prévoir la catastrophe ne l'a jamais empêchée. Ça vous use en l'attendant.

Le danger que vous guettez n'est pourtant pas devant vous. Il est derrière, dans des mémoires d'enfance que vous prenez pour le présent. L'humeur d'un parent qui virait sans prévenir. Des pas dans un escalier qu'il fallait déchiffrer avant la porte, pour savoir quelle soirée on allait passer. Un enfant, devant l'imprévisible, n'a qu'une parade : tout anticiper, tout surveiller, ne jamais être pris au dépourvu. Si je contrôle tout, je survis. C'était vrai à l'époque. Ce ne l'est plus. Vous ne vérifiez pas votre vie d'adulte. Vous surveillez une maison d'enfance qui n'existe plus.

Et l'anxiété vous arrange. Elle vous sert d'écran de fumée. Pour ne pas être triste, pour ne pas être en colère, vous avez peur, vous stressez, vous agissez. Votre système nerveux préfère encore l'anxiété à la vérité, parce que la vérité, dessous, fait bien plus mal. Alors vous voulez débattre, argumenter, démontrer. Tout plutôt que ressentir. Parce que ressentir revient à lâcher le contrôle, et que lâcher le contrôle, dans votre corps, veut dire mourir. C'est une mémoire d'enfance. Ce n'est pas une vérité.

Vous vous croyez victime de ce qui vous arrive. La réalité est plus dure à tenir. Vous scannez le moindre signe de désengagement chez l'autre, et ce scan fabrique exactement le désengagement que vous redoutez. Votre femme pose sa fourchette au milieu du dîner et dit « je ne suis pas un dossier ». Pour ne pas subir l'abandon, vous devenez l'agresseur que vous fuyez, bourreau et victime dans le même corps, par le même geste. Le triangle se referme sur vous. Et voilà des années que vous tournez dedans sans en voir les murs.`,
    septSymptomes: [
      `**La quête de regard.** Vous scrutez en permanence le moindre signe de désengagement chez l'autre. Un silence, un message plus tardif, un ton qui change, et l'alerte monte.`,
      `**La honte de soi.** Quand vous perdez le contrôle, vous vous sentez vulnérable, exposé, indigne. La honte se loge dans la poitrine, épaisse, et les excuses ne la délogent pas.`,
      `**La comparaison toxique.** Vous comparez votre couple, votre famille, votre vie à celles des autres en permanence, à la recherche du défaut.`,
      `**L'incompréhension.** Vous expliquez et ré-expliquez, avec des récapitulatifs et des pièces jointes, et l'autre ne comprend toujours pas. C'est insupportable.`,
      `**L'auto-effacement.** Sous l'agressivité du contrôle, il y a un enfant terrifié qui n'existe que dans la maîtrise. On vous dit carré, fiable. C'est le compliment qu'on vous fait depuis vingt ans, et c'est une laisse.`,
      `**La perte de contrôle.** Le symptôme central. Vous gérez tout, et tout vous échappe en permanence. Plus la main se referme, plus tout file entre les doigts.`,
      `**L'incapacité à s'affirmer.** Soit vous attaquez, soit vous explosez. Vous ne savez pas dire « j'ai peur » ou « j'ai besoin de toi » sans hostilité. C'est le corps qui l'interdit.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Contrôleur s'invite dans votre vie, sans encore avoir étouffé vos relations. Vous savez que vous verrouillez parfois trop fort, et vous savez vous reprendre. L'anxiété est là, mais récupérable. C'est le bon moment pour comprendre d'où elle vient, avant qu'elle ne s'incruste plus profondément dans le corps.`,
      modere: `Le schéma Contrôleur règle désormais une grande partie de votre quotidien. L'anticipation est devenue automatique. Vous fatiguez votre entourage et vous vous fatiguez vous-même. La tension corporelle est constante, la nuque en béton, la mâchoire soudée. On ne remercie pas une alarme, on finit par vouloir la débrancher, et vous le sentez autour de vous. Le moment est venu de regarder en face ce qui se cache sous le contrôle, parce que la fatigue va finir par avoir le dernier mot.`,
      profond: `Le schéma Contrôleur a pris la commande de votre vie entière. L'anxiété est permanente, le corps est en alerte rouge depuis trop longtemps, le sommeil ne vous répare plus. Vos relations ont commencé à se vider autour de vous, les gens répondent au lieu de raconter. Cette intensité demande un travail corporel encadré, parce que la pensée seule ne désarme pas le système nerveux. La tête comprend. Le corps répare.`,
    },
  },
  {
    id: 'fantome',
    nom: `FANTÔME RELATIONNEL`,
    icone: `Silhouette qui s'efface (SVG custom ou Lucide React \`User\` à 50% opacity)`,
    ambassadeur: `Pascale (fil rouge du livre)`,
    descriptionBase: `Vous partez avant qu'on vous quitte.

Vous fuyez. Que ça devienne sérieux, vous étouffez. Que l'autre s'approche, vous reculez. Votre stratégie : partir le premier, pour que l'abandon, au moins, vienne de vous. Ce n'est pas une liberté. C'est une prison, celle de la fuite. Présent de corps, absent d'âme, vous vivez derrière une vitre. Les gens ne se fâchent pas avec vous. Ils s'usent. Ils frappent contre le verre un moment, poliment, et puis ils passent leur chemin.

Regardez ce que fait votre corps quand l'autre s'approche pour un geste tendre. Le buste recule de deux centimètres. Deux centimètres qui détruisent quatorze ans. Un froid monte des mollets vers le ventre, l'envie de partir arrive avant même la décision. Au restaurant, vous prenez la chaise côté allée. Vous garez la voiture dans le sens du départ. Vous repérez les issues de secours de votre propre vie.

Il y a deux façons de fuir, et vous connaissez peut-être les deux. Vous quittez quelqu'un un matin et vous vous retrouvez en couple le soir même, avec un autre, parce que rester seul, ne serait-ce qu'une nuit, vous terrorise. Le Fantôme ne fuit pas une personne. Il fuit ce qu'il ressent quand il se retrouve seul avec lui-même. Ou bien vous restez, avec des partenaires qui vous rabaissent, qui vous font souffrir, et vous restez quand même. Pour quelle bonne raison ? Parce que vous y gagnez quelque chose, en secret. Souvent, de rester petit. De ne pas grandir. De ne pas déranger un parent ancien qui n'aurait pas supporté votre élan.

Petit, vous avez appris à lire le visage d'un parent avant d'apprendre à lire les mots, pour savoir si l'orage arrivait. Prendre de la place, c'était risquer de perdre l'amour. Alors vous avez choisi, sans le savoir, des liens qui vous maintiennent petit. Et vous avez fini par confondre le calme et la paix, le retrait et la solidité, l'absence de conflit et l'harmonie. Vous croyez que vous taire protège la relation. Votre silence la détruit.

Voici ce que personne ne vous a jamais dit. Vous n'avez jamais posé de limite de votre vie. Vous avez posé des absences. Vous partez avant d'avoir à dire non, vous vous effacez avant qu'on vous refuse, et le coût, c'est que vous n'apparaissez jamais vraiment, dans aucune relation. Vous restez au seuil de votre propre vie. Un bunker, ça marche. On y survit à tout, sauf à la vie.`,
    septSymptomes: [
      `**La quête de regard.** Vous le fuyez et vous le cherchez en même temps. Vous voulez être vu sans être exposé.`,
      `**La honte de soi.** Vous croyez ne pas avoir le droit d'occuper la place. De déranger. D'exister bruyamment.`,
      `**La comparaison toxique.** Tous les autres semblent savoir comment être en relation. Vous, non. Et vous vous comparez encore, et vous perdez encore.`,
      `**L'incompréhension.** Vous avez arrêté d'essayer de vous faire comprendre. De toute façon, ça ne sert à rien.`,
      `**L'auto-effacement.** Le symptôme central de votre profil. Vous vivez à travers une vitre, spectateur d'une vie qui semble arriver à quelqu'un d'autre.`,
      `**La perte de contrôle.** Vous croyez maîtriser en partant. En réalité, c'est l'évitement qui vous mène.`,
      `**L'incapacité à s'affirmer.** Vous ne dites ni oui ni non. Vous disparaissez.`,
    ],
    modulateursIntensite: {
      surface: `Le schéma Fantôme s'active dans votre vie, sans encore avoir éteint toute vie relationnelle. Vous fuyez parfois, et vous arrivez aussi à rester par moments. Le repli est encore réversible. C'est le bon moment pour comprendre la mécanique avant que la fuite ne devienne automatique. Pascale a connu ce stade. Elle l'a traversé.`,
      modere: `Le schéma Fantôme structure une grande partie de vos relations. Vous savez que vous fuyez, vous le voyez, et vous n'arrivez plus à vous arrêter. L'isolement s'installe doucement. La sensation de vivre derrière une vitre devient familière. Le moment est venu de regarder en face d'où vient cette impulsion à disparaître, parce qu'elle vous coupe désormais de votre propre vie.`,
      profond: `Le schéma Fantôme a pris toute la place. Vous avez sans doute déjà tout fui, plusieurs fois. Vous êtes seul depuis longtemps, ou vous êtes physiquement présent dans une relation où votre âme s'est absentée, un colocataire dans votre propre couple. La sensation d'être un fantôme dans votre propre vie est devenue permanente. Cette intensité demande un travail corporel encadré, parce qu'à ce stade, lire ne suffit plus. Pascale a été là. Elle s'effaçait depuis toujours. Une fois, elle est restée. Tout est parti de là. La vôtre peut changer aussi.`,
    },
  },
]

export const ctaParStatut: Record<StatutLivre, CtaParStatut> = {
  pas_lu: {
    amorce: `Vous venez de découvrir votre profil. Vous reconnaissez le mécanisme. C'est un premier pas.

Vous recevez maintenant par email **une séance de descente dans le corps, offerte**, guidée par ma voix. Vous commencez ce soir, à votre rythme. Le corps se met au travail là où la lecture seule ne va pas.

Et si vous voulez aller plus loin, vous découvrez le séminaire Régénération, l'immersion qui transforme ce que la compréhension seule ne transforme pas.

La tête comprend. Le corps répare.`,
    ctaPrincipal: { texte: `Ouvrir mon email et recevoir ma séance offerte`, url: `#` },
    ctaSecondaire: { texte: `Découvrir le séminaire Régénération`, url: `https://h3c.fr/solution` },
  },
  lu_partiel: {
    amorce: `Votre profil est maintenant identifié. Votre carte intérieure se précise.

Vous recevez par email **une séance de descente dans le corps, offerte**, guidée par ma voix. Elle vous accompagne dès ce soir. Le corps se met au travail là où comprendre seul ne va pas.

Si l'accompagnement corporel devient évident, vous découvrez le séminaire Régénération, l'immersion qui transforme ce que la compréhension seule ne transforme pas.`,
    ctaPrincipal: { texte: `Ouvrir mon email et recevoir ma séance offerte`, url: `#` },
    ctaSecondaire: { texte: `Découvrir le séminaire Régénération`, url: `https://h3c.fr/solution` },
  },
  lu_complet: {
    amorce: `Vous avez identifié votre schéma. Vous l'avez sans doute déjà vu agir dans plusieurs zones de votre vie.

Vous savez aussi maintenant que comprendre ne suffit pas.

Le travail réel commence dans le corps, dans un cadre encadré, avec un accompagnant. Le programme Régénération existe pour ça. Trois jours résidentiels, huit places, une transformation incarnée.

Si votre intensité est modérée ou profonde, et si vous êtes prêt à agir, c'est le pas suivant.`,
    ctaPrincipal: { texte: `Découvrir le séminaire Régénération`, url: `https://h3c.fr/solution` },
    ctaSecondaire: { texte: `Rejoindre la communauté Souverain au Quotidien`, url: `https://www.souverainauquotidien.com` },
  },
}
