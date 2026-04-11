'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, Translations, translations } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt-BR',
  setLanguage: () => {},
  t: translations['pt-BR'],
})

export function LanguageProvider({
  children,
  defaultLanguage = 'pt-BR',
}: {
  children: ReactNode
  defaultLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    const saved = localStorage.getItem('attica-language') as Language | null
    if (saved && translations[saved]) {
      setLanguageState(saved)
    }
  }, [])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem('attica-language', lang)
    // Save to Supabase as well
    fetch('/api/client/language', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }),
    }).catch(() => {}) // silently fail
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
