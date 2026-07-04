import React, { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, applyTheme, loadSavedTheme } from '../styles.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('sombre')

  // Charge le theme sauvegardé au démarrage
  useEffect(() => {
    const saved = loadSavedTheme()
    setThemeId(saved)
  }, [])

  const changeTheme = (id) => {
    if (!THEMES[id]) return
    applyTheme(id)
    setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
