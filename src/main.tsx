import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from 'next-themes'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { LanguageProvider } from "@/contexts/LanguageContext"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
