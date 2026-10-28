import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { updateDocumentSeo } from './utils/seo'

// Dynamically initialize SEO metadata in TypeScript
updateDocumentSeo();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
