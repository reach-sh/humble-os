import {
  PluralCategory, en, es, zh,
} from 'make-plural'

const CountryLanguage = require('@ladjs/country-language')

export const LOCALE_STORAGE_KEY = 'lang'

/** Helper Type (see "plurals" const) */
export type LanguagePlurals = Record<
  string,
  (n: number | string, ord?: boolean) => PluralCategory
>

export const DEFAULT_LOCALE = 'en-US'

/**
 * Explicitly supported locales. This object maps multiple locales to
 * single `plurals` export
 */
export const languagePlurals: LanguagePlurals = {
  'en-US': en,
  es,
  'zh-CN': zh, // Chinese - simplified
  'zh-TW': zh, // Chinese - traditional
}

/** Object descriptor of `Language` object from `CountryCode` npm package */
type ISO639_1_Language = {
  /* Writing direction (left-to-right, right-to-left) */
  direction: 'RTL' | 'LTR'
  /* Language family */
  family: string
  /* 2-letter code */
  iso639_1: string
  /* 3-letter code */
  iso639_2: string
  /* 3-letter code (alternate) */
  iso639_2en: string
  /* 3-letter code (alternate) */
  iso639_3: string
  /* Name (english characters) */
  name: string[]
  /* Name (native characters) */
  nativeName: string[]
}

/**
 * Condense all supported languages in `plurals` into a single object showing the
 * native display name for the language.
 */
export const supportedLocales = (() => {
  const AllLanguages: ISO639_1_Language[] = CountryLanguage.getLanguages()
  const supported: Record<string, string> = {}

  // For every key in the "language plurals" object
  Object.keys(languagePlurals).forEach((region) => {
    const key = region.split('-')[0]
    const language = AllLanguages.find((l) => l.iso639_1 === key)

    if (language) supported[key] = language?.nativeName[0]
  })

  return supported
})()

export const supportedLocaleKeys = Object.keys(supportedLocales)
