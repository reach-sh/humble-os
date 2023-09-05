import manifest from 'cryptocurrency-icons/manifest.json'
import confluxLogo from 'assets/conflux-logo.png'
import { CURRENT_PROVIDER, PROVIDERS } from './reach_constants'

/* Turns `CryptoIcons` manifest list into a key-value map for maximum lookups */
export interface CryptoIconData {
  color: string
  name: string
  symbol: string
}

/** Full key-value map of crypto symbols and image asset paths */
export const IconsMap: Map<string, CryptoIconData> = (
  manifest as CryptoIconData[]
).reduce((iconsMap, crypto) => iconsMap.set(crypto.symbol, crypto), new Map())

/* Manually add "Conflux", which is not in manifest list */
IconsMap.set('CFX', { name: 'Conflux', symbol: 'CFX', color: '#000' })

/**
 * Loads an icon for a cryptocurrency. Fall back to "generic.png" for missing imgs
 */
export function cryptoImage(
  symbol: string,
  id: string | number,
  color = false,
): string {
  if (symbol === 'CFX') return confluxLogo
  let img

  try {
    if (CURRENT_PROVIDER === PROVIDERS.MAINNET) {
      img = `https://asa-list.tinyman.org/assets/${id}/icon.png`
    } else {
      img = imgSrc(symbol.toLowerCase(), color)
    }
  } catch (error) {
    img = imgSrc('generic', color)
  }

  return img
}

// Img context: required for importing the icons as data urls
const imgContext = require.context(
  '../../node_modules/cryptocurrency-icons/svg/color',
  true,
)
const bwImgContext = require.context(
  '../../node_modules/cryptocurrency-icons/svg/black',
  true,
)
export function imgSrc(s: string, color?: boolean) {
  const path = `./${s.toLowerCase()}.svg`
  return color ? imgContext(path) : bwImgContext(path)
}
