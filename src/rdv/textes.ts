// Textes de la page /rdv/. Source : compte rendu de Cowork du 03/11/2026, partie B
// (99-Meta/Communications/DG/Inbox/2026-11-03_06h16_reponse-mission_etude-tunnel-apply-sta.md),
// décisions D2 à D13 du PLAN. Vouvoiement, lexique de la Règle 12, une demande et non un
// rendez-vous acquis. Les libellés des questions 2 et 3 et l'aide des réponses libres sont
// ceux du formulaire en service (QUESTIONS_VENTE).

export const AIDE_LIBRE = 'Quelques mots suffisent. Vous n’avez pas à tout raconter.'

export const T = {
  entete: 'Rendez-vous offert · 30 minutes · en visio sur Zoom',
  continuer: 'Continuer',
  passer: 'Passer cette question',
  retour: 'Retour',
  prenom: { question: 'Quel est votre prénom ?' },
  merci: (p: string) => `Merci, ${p}.`,
  situation: { question: 'Quelle situation relationnelle souhaitez-vous travailler ?', aide: AIDE_LIBRE },
  anciennete: { question: 'Depuis combien de temps cette difficulté est-elle présente ?' },
  objectif: { question: 'Qu’aimeriez-vous vivre autrement ?', aide: AIDE_LIBRE, facultatif: 'Facultatif' },
  coordonnees: {
    question: 'Vos coordonnées',
    nom: 'Votre nom',
    email: 'Votre adresse e-mail',
    emailAide: 'C’est là que vous recevrez la réponse à votre demande.',
    telephone: 'Votre numéro de téléphone',
    telephoneAide: 'Pour vous joindre si la visio se coupe.',
    sms: 'Recevoir aussi les rappels du rendez-vous par SMS',
    smsAide: 'Cette case ne concerne que les rappels. Si votre demande est acceptée, un SMS vous le confirme sur ce numéro.',
  },
  provenance: { question: 'Comment avez-vous découvert cet appel ?' },
  creneau: {
    titre: 'Choisissez le créneau de votre rendez-vous',
    pour: 'Pour :',
    modifier: 'Ce n’est pas vous ? Modifier',
    heures: 'Heures affichées :',
    changer: 'Changer',
    chargement: 'Chargement des créneaux…',
    aucun: 'Aucun créneau n’est libre pour le moment. Revenez dans quelques heures : de nouveaux créneaux s’ouvrent chaque jour.',
    bouton: 'Demander ce créneau',
    envoi: 'Envoi de votre demande…',
    sous: 'Votre demande n’est confirmée qu’après la réponse de Cyrille, sous 24 heures.',
    pris: 'Ce créneau vient d’être pris. Choisissez-en un autre : vos réponses sont gardées.',
    dejaDemande:
      'Une demande est déjà enregistrée pour cette adresse e-mail ou ce numéro. L’e-mail reçu après cette demande contient les liens pour la reprogrammer ou l’annuler. Vous ne le trouvez pas ? Écrivez à cyrille@h3c.life.',
  },
  fuseau: {
    question: 'Dans quel fuseau horaire êtes-vous ?',
    aide: 'Les heures des créneaux seront écrites dans ce fuseau.',
    paris: 'Heure de Paris',
    chercher: 'Chercher une ville',
    chercherAide: 'Par exemple : Montréal, Bruxelles, La Réunion.',
    aucun: 'Aucun fuseau ne correspond à cette recherche.',
  },
  confirmation: {
    bandeau: 'Votre demande est bien envoyée. Elle ne sera confirmée qu’après la réponse de Cyrille, sous 24 heures.',
    creneau: 'Créneau demandé :',
    titre: 'Voici ce qui se passe maintenant',
    son: 'Lancer avec le son',
    // Ce qui part réellement (relevé YouCanBookMe du 03/11 à 16h45) : l'accusé « Votre demande
    // de rendez-vous — je vous réponds sous 24 h » tout de suite, puis, si Cyrille valide, l'email
    // d'acceptation avec le lien Zoom (YouCanBookMe, puis A1 de tsa-api). Pas d'autre email entre.
    etapes: [
      ['Maintenant', 'Un e-mail vous confirme que votre demande est bien reçue.'],
      ['Sous 24 heures', 'La réponse de Cyrille, par e-mail. S’il valide le créneau, cet e-mail vous donne le lien de la visio Zoom.'],
    ] as [string, string][],
    rienTitre: 'Vous ne recevez rien ?',
    rien: 'Regardez d’abord dans vos courriers indésirables. Toujours rien 24 heures après votre demande ? Écrivez à',
  },
  repli: 'Un instant, nous vous redirigeons vers l’agenda de Cyrille…',
} as const

// Avertissement de la Règle 12, texte canonique (CLAUDE.md), décision D7.
export const AVERTISSEMENT =
  'Régénération est un programme de coaching et de développement personnel. Il ne constitue pas un soin médical, ni une psychothérapie au sens de la loi du 25 juillet 1985. Il ne se substitue pas à un suivi par un professionnel de santé habilité (médecin, psychiatre, psychologue, psychothérapeute reconnu ARS). Si vous traversez une situation nécessitant un accompagnement médical (idées suicidaires, dépression sévère, troubles psychiatriques actifs, addictions sévères), consultez un professionnel de santé ou appelez le 3114 (numéro national de prévention du suicide, gratuit, 24/7).'
