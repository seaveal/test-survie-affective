import whatsapp from './textes-whatsapp.json'
import { livraisonWhatsApp } from '../api/setting'
import textes from './textes.json'
import './commercial.css'
type Page = keyof typeof textes
export function PageCommerciale({ page, bouton, onAction }: { page: Page; bouton: string; onAction: (emplacement: 'haut' | 'bas') => void }) {
  const contenu = livraisonWhatsApp && page in whatsapp ? whatsapp[page as keyof typeof whatsapp] : textes[page]
  const morceaux = contenu.split('<!--ACTION-->')
  return <article className="saq-commercial">{morceaux.map((html, i) => <div key={i}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    {i < morceaux.length - 1 && <p><button type="button" className="saq-action" data-testid={i === 0 ? 'cta-haut' : 'cta-bas'} onClick={() => onAction(i === 0 ? 'haut' : 'bas')}>{bouton}</button></p>}
  </div>)}</article>
}
