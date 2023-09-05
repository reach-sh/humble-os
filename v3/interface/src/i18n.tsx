import { i18n } from '@lingui/core'
import {
  DEFAULT_LOCALE,
  languagePlurals,
  LOCALE_STORAGE_KEY,
  supportedLocales,
} from 'constants/i18n'

/* Dynamically load i18n settings */
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./locales/${locale}/messages`)
  i18n.loadLocaleData(locale, { plurals: languagePlurals[locale] })
  i18n.load(locale, messages)
  i18n.activate(locale)

  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
  return locale
}

/**
 * Determine language from navigator/user agent (browser)
 * @returns {string} Language locale
 */
export function getUserLocale(): string {
  // Check local storage
  const storedLanguage = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedLanguage) return storedLanguage

  // If nothing, check user device
  const { language } = navigator
  if (!language) return DEFAULT_LOCALE

  // Use device settings to generate correct locale
  const [lang, region] = language.split('-')
  return region
    ? parseLocale(`${lang}-${region.toUpperCase()}`)
    : parseLocale(lang)
}

/**
 * Return locale if supported, or set language to US English
 * @param targetLocale Locale identifier
 * @returns {string} Matching locale for target
 */
function parseLocale(targetLocale: string): string {
  const splitRegion = (s: string) => s.split('-')[0]
  const lower = (s: string) => s.toLowerCase()
  const langKeys = Object.keys(supportedLocales)

  // If the region exists as-is, return it
  if (langKeys.includes(targetLocale)) return splitRegion(targetLocale)

  // Otherwise attempt to match from existing keys
  // If that fails, return the default (US English)
  const best = langKeys.find(
    (k) => lower(splitRegion(k)) === lower(splitRegion(targetLocale)),
  )

  return best ?? splitRegion(DEFAULT_LOCALE)
}
