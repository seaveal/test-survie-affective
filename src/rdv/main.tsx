import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import AppRdv from './AppRdv.tsx'
import { veillerAccordContact } from '../api/client.ts'

veillerAccordContact()

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRdv />
  </StrictMode>,
)
