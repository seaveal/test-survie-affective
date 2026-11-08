/** Build flag stays off until the three-way transport/human/receipt recipe passes. */
export const livraisonWhatsApp = import.meta.env.VITE_RESULTATS_WHATSAPP === 'true'
export interface Delivery {
  state: 'saved'
  delivery: 'whatsapp'
  whatsapp_url: string
  retained_until: number
  access_hours: 24
}
export function nouvelleSoumission(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')
}
export function garderLivraison(game: 'tsa' | 'rv', value: unknown): void {
  if (!value || typeof value !== 'object' || !('delivery' in value) || value.delivery !== 'whatsapp') return
  try { localStorage.setItem(`setting.delivery.${game}`, JSON.stringify(value)) } catch { /* Live event still updates this screen. */ }
  window.dispatchEvent(new CustomEvent('setting-delivery', { detail: { game, value } }))
}
export function lireLivraison(game: 'tsa' | 'rv'): Delivery | null {
  try {
    const value = JSON.parse(localStorage.getItem(`setting.delivery.${game}`) ?? 'null') as Delivery | null
    return value?.state === 'saved' && value.retained_until > Date.now()/1000 ? value : null
  } catch { return null }
}
export function effacerLivraison(game: 'tsa' | 'rv'): void {
  try { localStorage.removeItem(`setting.delivery.${game}`) } catch { /* Optional cache. */ }
  window.dispatchEvent(new CustomEvent('setting-delivery', { detail: { game, value: null } }))
}
