import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Welcome } from './Welcome'

describe('Accueil approuvé — parcours et information avant capture', () => {
  it('présente un seul titre, les quatre profils et le nombre de questions', () => {
    render(<Welcome onCommencer={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reconnaissez votre façon de préserver le lien')
    for (const name of ['Mendiant de Luxe', 'Sauveur Épuisé', 'Contrôleur Anxieux', 'Fantôme Relationnel']) expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getAllByText('25 questions · Offert · Profil par email')).toHaveLength(2)
  })
  it.each(['haut', 'bas'])('le bouton %s commence et transmet son emplacement', async (emplacement) => {
    const onCommencer = vi.fn(), suivre = vi.fn()
    window.h3cTrackPage = suivre
    render(<Welcome onCommencer={onCommencer} />)
    const bouton = screen.getByTestId('cta-'+emplacement)
    bouton.focus(); expect(bouton).toHaveFocus()
    await userEvent.click(bouton)
    expect(onCommencer).toHaveBeenCalledTimes(1)
    expect(suivre).toHaveBeenCalledWith('cta_commencer_test', { emplacement })
    delete window.h3cTrackPage
  })
  it('annonce la capture et le caractère facultatif des messages avant de commencer', () => {
    render(<Welcome onCommencer={() => {}} />)
    expect(screen.getByText(/Après les premières, on vous demande votre email/)).toBeInTheDocument()
    expect(screen.getByText(/Votre profil et votre séance vous sont envoyés dans tous les cas/)).toBeInTheDocument()
    expect(screen.getByRole('link', {name:/Réserver mon appel offert de 45 minutes/})).toHaveAttribute('href','https://h3c.fr/XyHCN')
  })
})

describe('DEST-07 — pages statiques servies (public/*.html)', () => {
  const PUBLIC = join(__dirname, '..', '..', 'public')
  const pages = readdirSync(PUBLIC).filter((f) => f.endsWith('.html'))

  it('trouve au moins une page, dont iframe-test.html (contrôle positif du balayage)', () => {
    expect(pages).toContain('iframe-test.html')
  })

  it.each(pages)('%s n\'écrit jamais « Test de survie affective » en minuscules', (page) => {
    const html = readFileSync(join(PUBLIC, page), 'utf-8')
    expect(html).not.toMatch(/Test de survie affective/)
  })
})

// Audit T19 (2026-10-24), WEB-T15-06 et C15-04 : les pages légales servies depuis public/.
// Mentions : le numéro de TVA de la société est affiché (LCEN, société assujettie).
// CGV : deux documents en vigueur (registre CGV-versions.md) ; aucun lien du site ne vise
// directement celles du livre, tout passe par /cgv/, qui présente les deux.
describe('Pages légales servies (WEB-T15-06, C15-04)', () => {
  const RACINE = join(__dirname, '..', '..')
  const lire = (chemin: string) => readFileSync(join(RACINE, chemin), 'utf-8')

  it('les mentions légales portent le numéro de TVA intracommunautaire', () => {
    expect(lire('public/mentions-legales/index.html')).toContain('FR87109142000')
  })

  it('/cgv/ présente les deux CGV, sans « un seul exemplaire » ni redirection automatique', () => {
    const cgv = lire('public/cgv/index.html')
    expect(cgv).toContain('https://regeneration.souverainauquotidien.com/cgv/')
    expect(cgv).toContain('https://livre.souverainauquotidien.com/cgv.html')
    expect(cgv).not.toMatch(/un seul exemplaire/)
    expect(cgv).not.toMatch(/http-equiv="refresh"|location\.replace/)
  })

  it.each([
    'index.html',
    'public/mentions-legales/index.html',
    'public/privacy/index.html',
    'src/components/DisclaimerFooter.tsx',
  ])('%s fait passer le lien CGV par /cgv/', (chemin) => {
    const texte = lire(chemin)
    expect(texte).toMatch(/href=\{?["']?\/cgv\/|URL_CGV = '\/cgv\/'/)
    expect(texte).not.toMatch(/href="https:\/\/livre\.souverainauquotidien\.com\/cgv\.html"|URL_CGV = 'https/)
  })

  it('le pied de page rendu mène à /cgv/', () => {
    render(<Welcome onCommencer={() => {}} />)
    expect(screen.getByRole('link', { name: /^cgv$/i })).toHaveAttribute('href', '/cgv/')
  })
})
