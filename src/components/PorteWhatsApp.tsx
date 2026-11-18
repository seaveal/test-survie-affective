// Porte WhatsApp (plan unique du 16/11/2026, lot 2 bis « WhatsApp d'abord ») : la personne écrit
// la première, d'un clic. Un lien court par emplacement (h3c.fr/wa-<emplacement>) ; le message
// prérempli, qui dit l'origine, est porté par le lien court. Qui n'a pas encore parlé à Cyrille va
// au 07 (Ficiel), qui a réservé va au 06 : c'est le code qui choisit. Toujours sous le premier appel
// à l'action de la page, jamais au-dessus.
export const LIBELLE_WHATSAPP = 'Écrivez-moi sur WhatsApp'

export function PorteWhatsApp({ code, invite, classe = 'mx-6 mt-6 text-center' }: { code: string; invite: string; classe?: string }) {
  return (
    <div className={classe} data-testid="porte-whatsapp">
      <p className="text-base">{invite}</p>
      <a href={`https://h3c.fr/${code}`} target="_blank" rel="noopener" referrerPolicy="no-referrer"
        className="tsa-porte-whatsapp mt-3 inline-block rounded-lg px-6 py-3 text-base font-medium"
        data-testid="porte-whatsapp-lien">
        {LIBELLE_WHATSAPP}
      </a>
    </div>
  )
}
