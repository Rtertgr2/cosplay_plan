import { createContext } from 'react'

/**
 * Theme context (pure — แยกจาก component เพื่อ fast refresh: react-refresh/only-export-components)
 */
export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
