import { create } from 'zustand'
import type { Theme } from '../types'

const STORAGE_KEY = 'note-web-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.setAttribute('data-theme', resolved)
}

function loadSavedTheme(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  initTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  resolvedTheme: 'light',

  initTheme: () => {
    const saved = loadSavedTheme()
    const resolved = resolveTheme(saved)
    applyTheme(saved)
    set({ theme: saved, resolvedTheme: resolved })

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
      if (current === 'system') {
        const r = getSystemTheme()
        document.documentElement.setAttribute('data-theme', r)
        set({ resolvedTheme: r })
      }
    })
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme, resolvedTheme: resolveTheme(theme) })
  },
}))
