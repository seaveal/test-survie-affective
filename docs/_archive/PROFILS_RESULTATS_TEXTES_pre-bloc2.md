# Pages de résultats : textes par profil et par intensité

**Document de référence pour l'implémentation des 24 variations de pages de résultats.**
Toute modification doit être validée par Cyrille avant intégration.

---

## Structure d'une page de résultat

Une page de résultat se compose en 3 niveaux verticaux :

**Niveau 1 : Révélation** (visible immédiatement)
- Titre : "Votre profil dominant : [Nom]"
- Icône emblématique
- Description de base du profil
- Mention profil secondaire si applicable
- Indicateur d'intensité visuel
- Modulateur d'intensité (paragraphe spécifique au croisement profil × intensité)

**Niveau 2 : Lecture fine** (visible au scroll)
- Les 7 symptômes contextualisés selon le profil

**Niveau 3 : Passage à l'action** (visible au scroll)
- Roadmap personnalisée (voir ROADMAPS_PERSONNALISEES.md)
- CTA adapté au statut livre

---

# PROFIL 1 : LE MENDIANT DE LUXE

**id** : `mendiant`
**Icône** : Couronne fissurée (Lucide React `Crown`)
**Stratégie** : Performance ("Si je suis parfait, on ne m'abandonnera pas")
**Ambassadeur** : Yann

## Description de base (commune aux 3 intensités)

Vous brillez. Vous performez. Vous excellez dans tout ce que vous faites.

Mais ça ne suffit jamais.

Derrière chaque victoire, il y a cette voix qui vous dit que vous devez en faire plus. Être plus. Donner plus. Pour mériter l'amour.

Vous êtes accro au regard des autres comme un junkie à sa dose. Et c'est plus fort que vous.

Vous avez collectionné les diplômes, les performances, les compliments. Vous avez tout fait pour être à la hauteur. Et pourtant, l'angoisse revient toujours. Le sentiment d'imposture. La peur d'être démasqué.

L'amour ne se mérite pas. Il se reçoit. Mais recevoir, c'est exactement ce que vous ne savez pas faire.

## Les 7 symptômes (Mendiant, communs aux 3 intensités)

1. **La quête de regard.** Vous mesurez votre valeur au nombre de têtes qui se tournent quand vous entrez dans une pièce.

2. **La honte de soi.** Quand le regard manque, l'effondrement intérieur est immédiat. Comme si vous n'existiez plus.

3. **La comparaison toxique.** Vous scannez en permanence. Lui est plus brillant. Elle est plus aimée. Vous perdez à chaque fois.

4. **L'incompréhension.** Vous brillez fort, mais personne ne voit qui vous êtes au fond. Vous avez fini par ne plus essayer.

5. **L'auto-effacement masqué.** Sous la performance, il y a un enfant qui ne sait pas demander, ni recevoir, ni reposer.

6. **La perte de contrôle.** Quand quelque chose vous échappe (un échec, une critique, un silence), tout l'édifice vacille.

7. **L'incapacité à s'affirmer.** Vous brillez ou vous explosez. Vous ne savez pas dire calmement "j'ai besoin de quelque chose" ou "ça ne me va pas".

## Modulateurs d'intensité (Mendiant)

### Intensité SURFACE

Le schéma Mendiant existe en vous, mais il reste pour l'instant gérable. Vous performez, vous brillez, et la fatigue s'installe doucement sans encore vous abattre. Vous reconnaissez la mécanique, vous la nommez, vous la voyez à l'œuvre. C'est précieux. C'est le bon moment pour agir, avant que la spirale ne se referme.

### Intensité MODÉRÉE

Le schéma Mendiant tourne en boucle dans votre vie. Vous donnez beaucoup, vous donnez bien, et vous récoltez de moins en moins. La fatigue est devenue compagne. Les compliments ne tiennent plus la distance. Vous sentez que la performance ne suffit plus à colmater ce qui vous manque au fond. Le moment est venu de ralentir et de descendre dans le corps.

### Intensité PROFONDE

Le schéma Mendiant a pris toute la place. Vous ne savez plus exister sans performer. La voix qui répète "pas à la hauteur" tourne en boucle. Le burn-out, l'effondrement, ou le sentiment d'imposture vous talonnent. Cette intensité demande une intervention sérieuse. Pas un livre seul. Pas une lecture rapide. Un vrai travail corporel encadré, parce que la tête à elle seule ne fera pas le chemin.

---

# PROFIL 2 : LE SAUVEUR ÉPUISÉ

**id** : `sauveur`
**Icône** : Cape déchirée (Lucide React `Shield`)
**Stratégie** : Utilité ("Si je suis indispensable, on ne m'abandonnera pas")
**Ambassadeur** : Florian

## Description de base

Vous donnez. Vous aidez. Vous sauvez.

Tout le monde compte sur vous. Tout le monde sait qu'il peut s'appuyer sur vous.

Mais qui s'occupe de vous ?

Vous vous épuisez à rendre les autres heureux. Vous ravalez vos propres besoins, vous reportez vos projets, vous oubliez vos rêves. Vous attendez secrètement qu'un jour, quelqu'un fera pareil pour vous.

Ce jour ne vient pas.

Tant que vous donnez pour recevoir, vous ne recevrez jamais ce dont vous avez profondément besoin.

Vous avez peur de déranger. Tellement peur que vous avez disparu sous les besoins des autres. Et personne ne s'en est aperçu.

## Les 7 symptômes (Sauveur)

1. **La quête de regard.** Vous cherchez à être bien vu, considéré, reconnu pour tout ce que vous faites pour les autres.

2. **La honte de soi.** Quand vous ne donnez pas, vous ne valez plus rien à vos propres yeux.

3. **La comparaison toxique.** Vous vous comparez à des gens qui semblent recevoir naturellement, et vous vous sentez minuscule.

4. **L'incompréhension.** Vous donnez tellement, et personne ne semble voir ce que vous portez. Vous avez arrêté d'expliquer.

5. **L'auto-effacement.** Vous occupez la place de tous les autres, jamais la vôtre.

6. **La perte de contrôle.** Quand quelqu'un que vous avez sauvé vous lâche ou vous trahit, tout s'effondre d'un coup.

7. **L'incapacité à s'affirmer.** Soit vous vous écrasez et vous donnez encore plus, soit vous explosez et vous regrettez.

## Modulateurs d'intensité (Sauveur)

### Intensité SURFACE

Le schéma Sauveur s'active dans votre vie, sans avoir encore tout pris. Vous donnez beaucoup, vous le savez, et vous savez aussi vous arrêter de temps en temps. La fatigue est présente mais récupérable. C'est le bon moment pour comprendre la mécanique avant qu'elle ne se cristallise. Le corps est encore disponible pour apprendre à recevoir.

### Intensité MODÉRÉE

Le schéma Sauveur structure désormais une grande partie de votre vie. Vous donnez par réflexe, sans même réaliser que vous le faites. La fatigue est chronique. Vous portez plusieurs personnes à bout de bras, et personne ne porte la vôtre. Le moment est venu de mettre des mots et un cadre sur ce qui se joue, parce que la spirale s'accélère.

### Intensité PROFONDE

Le schéma Sauveur a colonisé votre identité. Vous ne savez plus exister sans aider. L'épuisement frôle le burn-out, ou il l'a déjà rencontré. Vous donnez avec une rage cachée et vous sentez monter une amertume que vous n'osez pas nommer. Cette intensité demande un travail sérieux et corporel, parce qu'à ce stade, la tête a tout compris depuis longtemps. Et rien n'a changé.

---

# PROFIL 3 : LE CONTRÔLEUR ANXIEUX

**id** : `controleur`
**Icône** : Tour de surveillance (Lucide React `Eye`)
**Stratégie** : Contrôle ("Si je contrôle tout, je peux éviter l'abandon")
**Ambassadeur** : Antoine

## Description de base

Vous anticipez. Vous vérifiez. Vous contrôlez.

Si vous lâchez prise, tout pourrait s'effondrer.

L'incertitude vous fait peur. L'imprévu vous angoisse. Le silence de l'autre vous met en alerte rouge.

Alors vous serrez. Vous tenez. Vous étouffez.

Vous serrez si fort que vous repoussez ceux que vous voulez garder.

Plus vous contrôlez, plus vous repoussez les autres. Et plus vous repoussez, plus vous confirmez la peur d'être abandonné. La boucle est parfaite. Elle est aussi insupportable.

Vous croyez tenir le monde. C'est le monde qui vous tient.

## Les 7 symptômes (Contrôleur)

1. **La quête de regard.** Vous scrutez en permanence le moindre signe de désengagement chez l'autre.

2. **La honte de soi.** Quand vous perdez le contrôle, vous vous sentez vulnérable, exposé, indigne.

3. **La comparaison toxique.** Vous comparez votre couple, votre famille, votre vie à celles des autres en permanence, à la recherche du défaut.

4. **L'incompréhension.** Vous expliquez et ré-expliquez, et l'autre ne comprend toujours pas. C'est insupportable.

5. **L'auto-effacement.** Sous l'agressivité du contrôle, il y a un enfant terrifié qui n'existe que dans la maîtrise.

6. **La perte de contrôle.** Le symptôme central. Tout vous échappe en permanence, malgré tous vos efforts.

7. **L'incapacité à s'affirmer.** Soit vous attaquez, soit vous explosez. Vous ne savez pas formuler "j'ai peur" ou "j'ai besoin de toi" sans hostilité.

## Modulateurs d'intensité (Contrôleur)

### Intensité SURFACE

Le schéma Contrôleur s'invite dans votre vie, sans encore avoir étouffé vos relations. Vous savez que vous serrez parfois trop fort, et vous savez vous reprendre. L'anxiété est là, mais récupérable. C'est le bon moment pour comprendre d'où elle vient, avant qu'elle ne s'incruste plus profondément dans le corps.

### Intensité MODÉRÉE

Le schéma Contrôleur règle désormais une grande partie de votre quotidien. L'anticipation est devenue automatique. Vous fatiguez votre entourage et vous fatiguez vous-même. La tension corporelle est constante. Le moment est venu de regarder en face ce qui se cache sous le contrôle, parce que la fatigue va finir par avoir le dernier mot.

### Intensité PROFONDE

Le schéma Contrôleur a pris la commande de votre vie entière. L'anxiété est permanente, le corps est en alerte rouge depuis trop longtemps, le sommeil ne vous répare plus. Vos relations ont commencé à se vider autour de vous. Cette intensité demande un travail corporel encadré, parce que la pensée seule ne désarme pas le système nerveux. La tête comprend. Le corps répare.

---

# PROFIL 4 : LE FANTÔME RELATIONNEL

**id** : `fantome`
**Icône** : Silhouette qui s'efface (SVG custom ou Lucide React `User` à 50% opacity)
**Stratégie** : Fuite ("Je pars avant qu'on me quitte")
**Ambassadrice** : Pascale (fil rouge du livre)

## Description de base

Vous disparaissez. Vous vous effacez. Vous fuyez.

Dès que ça devient trop intense, vous prenez la tangente.

Pas par manque d'amour. Par peur de le perdre.

Vous partez avant qu'on vous quitte. Vous gardez vos distances avant qu'on vous blesse. Vous coupez avant qu'on coupe.

En fuyant la douleur, vous fuyez aussi l'amour.

Vous avez tellement peur de déranger que vous avez disparu. Et personne ne s'en est aperçu. C'est exactement ça le drame. Personne ne vous a cherché parce que vous aviez tout fait pour qu'on ne vous trouve pas.

Vous avez l'impression d'être un fantôme dans votre propre vie. Présent et absent à la fois.

## Les 7 symptômes (Fantôme)

1. **La quête de regard.** Vous le fuyez et vous le cherchez en même temps. Vous voulez être vu sans être exposé.

2. **La honte de soi.** Vous croyez ne pas avoir le droit d'occuper la place. De déranger. D'exister bruyamment.

3. **La comparaison toxique.** Tous les autres semblent savoir comment être en relation. Vous, non.

4. **L'incompréhension.** Vous avez arrêté d'essayer de vous faire comprendre. De toute façon, ça ne sert à rien.

5. **L'auto-effacement.** Le symptôme central de votre profil. Vous vivez à travers une vitre.

6. **La perte de contrôle.** Vous croyez maîtriser en partant. En réalité, c'est l'évitement qui vous mène.

7. **L'incapacité à s'affirmer.** Vous ne dites ni oui ni non. Vous disparaissez.

## Modulateurs d'intensité (Fantôme)

### Intensité SURFACE

Le schéma Fantôme s'active dans votre vie, sans encore avoir éteint toute vie relationnelle. Vous fuyez parfois, et vous arrivez aussi à rester par moments. Le repli est encore réversible. C'est le bon moment pour comprendre la mécanique avant que la fuite ne devienne automatique. Pascale a connu ce stade. Elle l'a traversé.

### Intensité MODÉRÉE

Le schéma Fantôme structure une grande partie de vos relations. Vous savez que vous fuyez, vous le voyez, et vous n'arrivez plus à vous arrêter. L'isolement s'installe doucement. Le sentiment de vivre derrière une vitre devient familier. Le moment est venu de regarder en face d'où vient cette impulsion à disparaître, parce qu'elle vous coupe désormais de votre propre vie.

### Intensité PROFONDE

Le schéma Fantôme a pris toute la place. Vous avez sans doute déjà tout fui, plusieurs fois. Vous êtes seul depuis longtemps, ou vous êtes physiquement présent dans une relation où votre âme s'est absentée. La sensation d'être un fantôme dans votre propre vie est devenue permanente. Cette intensité demande un travail corporel encadré, parce qu'à ce stade, lire ne suffit plus. Pascale a été là. Elle a fui le travail pendant 18 mois. Elle est revenue. Sa vie a changé. La vôtre peut changer aussi.

---

# MENTION DU PROFIL SECONDAIRE (générique)

Si applicable (écart < 4 points avec dominant), ce paragraphe s'affiche entre la description et les 7 symptômes :

> Vous oscillez aussi avec une forte tendance **{nom_profil_secondaire}**. Selon les contextes, vous basculez d'une stratégie à l'autre. Ce détail compte. Le livre vous expliquera pour quelle bonne raison votre histoire a construit cette double stratégie, et comment retrouver la cohérence intérieure.

---

# CTA ADAPTÉS PAR STATUT LIVRE

## Si statutLivre = `pas_lu`

**Bloc d'amorce livre** (avant les CTA) :

> Vous venez de découvrir votre profil. Vous reconnaissez le mécanisme. Mais vous n'avez encore qu'une petite partie de l'image.
>
> Le livre "Vous avez tout compris. Rien n'a changé." raconte l'histoire de Pascale, qui a vécu exactement votre profil de survie. Il décortique la blessure d'abandon, la projection sur le partenaire, et le travail corporel qui répare là où la pensée échoue.
>
> La tête comprend. Le corps répare.

**CTA principal** :
- Texte : Commander le livre maintenant
- URL : https://cyrillenovou.com/livre

**CTA secondaire** :
- Texte : Réserver un appel stratégique pour le programme Régénération
- URL : https://cyrillenovou.com/appel

## Si statutLivre = `lu_partiel`

**Bloc d'amorce** :

> Vous êtes en train de lire le livre. Votre profil est maintenant identifié. Continuez votre lecture en gardant ce profil à l'esprit. Les chapitres recommandés ci-dessus vous parleront différemment maintenant.
>
> Et si la lecture seule commence à montrer ses limites, le passage suivant est l'accompagnement corporel.

**CTA principal** :
- Texte : Continuer la lecture du livre
- URL : https://cyrillenovou.com/livre

**CTA secondaire** :
- Texte : Réserver un appel stratégique pour le programme Régénération
- URL : https://cyrillenovou.com/appel

## Si statutLivre = `lu_complet`

**Bloc d'amorce** :

> Vous avez lu le livre. Vous avez identifié votre schéma. Vous avez sans doute commencé à voir certaines choses différemment.
>
> Vous savez aussi maintenant que comprendre ne suffit pas.
>
> Le travail réel commence dans le corps, dans un cadre encadré, avec un accompagnant. Le programme Régénération existe pour ça. Trois jours résidentiels, six places, une transformation incarnée.
>
> Si votre intensité est modérée ou profonde, et si vous êtes prêt à agir, c'est le pas suivant.

**CTA principal** :
- Texte : Réserver un appel stratégique pour Régénération
- URL : https://cyrillenovou.com/appel

**CTA secondaire** :
- Texte : Rejoindre la communauté Circle
- URL : https://cyrillenovou.circle.so

---

# FOOTER COMMUN À TOUTES LES PAGES

```
─────────────────────────────────────

L'enfant abandonné en vous n'a pas besoin de comprendre.
Il a besoin de recevoir.

La tête comprend. Le corps répare.

[CTA principal]
[CTA secondaire]

─────────────────────────────────────

Cyrille Novou
Méthode H3C : Conscience, Corps, Comportements
www.cyrillenovou.com
```

---

Document de référence à intégrer en TypeScript typé dans `src/data/profils.ts`.
