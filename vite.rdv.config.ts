// Second passage du build : la page /rdv/ (demande de rendez-vous, chantier RDV page maison,
// 03/11/2026). Un build à part et non une seconde entrée : le paquet du Test, en production,
// reste octet pour octet celui d'avant (une entrée commune aurait sorti React dans un morceau
// partagé). Écrit dans dist/ sans le vider, après le build du Test.
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// index.css exclut src/rdv de l'analyse de Tailwind, pour que la feuille du Test ne change pas ;
// pour la page /rdv/, on lève cette exclusion avant que Tailwind ne lise la feuille.
const ANALYSER_RDV = {
  name: 'rdv-analyser-ses-classes',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (id.split('?')[0].endsWith('/src/index.css')) return code.replace('@source not "./rdv";', '')
  },
}

export default defineConfig({
  plugins: [ANALYSER_RDV, react(), tailwindcss()],
  publicDir: false,
  build: {
    emptyOutDir: false,
    rollupOptions: { input: { rdv: fileURLToPath(new URL('./rdv/index.html', import.meta.url)) } },
  },
})
