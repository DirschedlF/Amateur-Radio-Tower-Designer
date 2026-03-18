import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('lang') || 'de'
  )

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'de' ? 'en' : 'de'
      localStorage.setItem('lang', next)
      return next
    })
  }, [])

  const t = useCallback(
    (key) => translations[lang][key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
