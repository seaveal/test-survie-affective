import textes from './textes.json'
import './commercial.css'
type Page = keyof typeof textes
export function PageCommerciale({ page, bouton, onAction }: { page: Page; bouton: string; onAction: (emplacement: 'haut' | 'bas') => void }) {
  const morceaux = textes[page].split('<!--ACTION-->')
  return <article className="saq-commercial">{morceaux.map((html, i) => <div key={i}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    {i < morceaux.length - 1 && <p><button type="button" className="saq-action" data-testid={i === 0 ? 'cta-haut' : 'cta-bas'} onClick={() => onAction(i === 0 ? 'haut' : 'bas')}>{bouton}</button></p>}
  </div>)}</article>
}
