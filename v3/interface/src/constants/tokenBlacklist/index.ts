import { Token } from 'types/shared'

import ETH_BLACKLIST from './eth'
import ALGO_BLACKLIST from './algo'
import CFX_BLACKLIST from './cfx'

const BLACKLISTED_TOKENS: Record<string, Token[]> = {
  ETH: ETH_BLACKLIST,
  ALGO: ALGO_BLACKLIST,
  CFX: CFX_BLACKLIST,
}

export default BLACKLISTED_TOKENS
