import { createContext, useContext } from 'react'

// eslint-disable-next-line no-shadow
export enum ThemeEnum {
  Dark = 'Dark',
  Light = 'Light',
}

export type ThemeContextType = {
  theme: ThemeEnum
  setTheme: (Theme: ThemeEnum) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeEnum.Dark,
  setTheme: (theme: ThemeEnum) => theme,
})
export const useTheme = () => useContext(ThemeContext)
