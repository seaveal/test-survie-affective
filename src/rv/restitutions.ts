// Restitutions affichées à l'écran du résultat RETROUVEZ-VOUS, copiées de RESTITUTIONS.md
// (vault 10-PRO/13-PHM/Marketing/Retrouvez-vous/, Operator Stack du 02/11/2026, pending-cyrille).
// Aucune logique ici, seulement les textes.
import type { DimensionRv, NiveauRv } from '../domain/rv/types'

export const RESTITUTIONS_RV: {
  priorites: Record<DimensionRv | 'incomplet', { titre: string, ecran: string, seconde: string }>
  niveaux: Record<NiveauRv, string>
  scoreIncomplet: string
} = {
  priorites: {
    realite: {
      titre: "Retrouver confiance en sa propre réalité",
      ecran: "Après chaque échange, vous semblez avoir appris à douter avant de croire. Vous repassez la scène, vous cherchez votre part de responsabilité, vous attendez qu'on vous confirme. Ce mécanisme s'est installé en vous, et c'est lui qui se travaille.",
      seconde: "Votre confiance dans vos perceptions semble aussi sollicitée. Le doute après un échange et la relecture des conversations peuvent peser en arrière-plan, et ils se travaillent eux aussi.",
    },
    attachement: {
      titre: "Retrouver sa liberté émotionnelle",
      ecran: "Une part de votre attention semble encore tournée vers cette personne, dans l'attente d'un message, d'excuses ou d'un changement. Cette attente entretient le lien. Ressentir du manque n'oblige pas à reprendre la relation.",
      seconde: "Une part de votre attention semble aussi rester tournée vers cette personne. L'attente d'un message ou d'un changement peut entretenir le lien, et ressentir du manque n'oblige pas à reprendre la relation.",
    },
    securite: {
      titre: "Retrouver un sentiment de sécurité",
      ecran: "Votre attention semble encore se régler sur les réactions de cette personne, pour anticiper la suite. Cette veille permanente s'est installée pour vous protéger. Elle use, et elle peut se poursuivre même au calme.",
      seconde: "Votre sentiment de sécurité semble aussi concerné. Anticiper les réactions de cette personne demande de l'énergie, et cette vigilance peut se poursuivre au calme.",
    },
    autonomie: {
      titre: "Récupérer son autonomie",
      ecran: "Vos choix semblent s'être organisés autour d'une question : comment éviter la tension ? Renoncer, justifier et laisser les autres décider sont des réflexes appris pour préserver la paix. Ils se déclenchent encore, et c'est ce qui se travaille.",
      seconde: "Votre liberté de choix semble aussi concernée. Renoncer pour éviter la tension ou justifier vos décisions peut devenir un automatisme, et il se travaille.",
    },
    identite: {
      titre: "Retrouver son identité",
      ecran: "Votre façon de vous percevoir semble encore influencée par le jugement de cette personne, et vos envies sont passées au second plan. Cet effacement s'est fait par petites concessions successives. Il se travaille de la même façon, pas à pas.",
      seconde: "Votre manière de vous percevoir semble aussi concernée. Vos envies, vos valeurs et vos projets peuvent être passés au second plan, et ils se reprennent pas à pas.",
    },
    incomplet: {
      titre: "Un bilan à compléter",
      ecran: "Quelques réponses manquent pour établir des repères dans chaque dimension. Vous pouvez recommencer le bilan quand vous le souhaitez, ou en parler directement au cours d'un appel offert.",
      seconde: "",
    },
  },
  niveaux: {
    ressources: "Ressources disponibles",
    fragilites: "Fragilités ponctuelles",
    difficultes: "Difficultés fréquentes",
    tres_presentes: "Difficultés très présentes",
  },
  scoreIncomplet: 'Résultat incomplet',
}
