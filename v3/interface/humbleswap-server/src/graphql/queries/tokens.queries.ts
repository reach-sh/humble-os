import { intArg, list, nonNull, queryField, stringArg } from 'nexus'
import * as Tokens from '../services/Tokens.service'
import {
  chainIdentifiers,
  chainIdentifierArgs,
  GetByIdOpts,
  GetListOpts,
} from '../utils'

const getByIdArgs = {
  id: nonNull(stringArg()),
  ...chainIdentifierArgs(),
}

/** Fetch a single Token */
export const getToken = queryField('getToken', {
  type: 'HSToken',
  args: getByIdArgs,
  async resolve(_, args) {
    return Tokens.getTokenById(args as GetByIdOpts)
  },
})

/** Fetch a list of Tokens */
export const searchTokens = queryField('searchTokens', {
  type: list('HSToken'),
  args: {
    id: stringArg(),
    name: stringArg(),
    symbol: stringArg(),
    ...chainIdentifierArgs(),
  },
  resolve(_, args) {
    const { chain: c, provider: p } = chainIdentifiers()
    return Tokens.searchTokensByCriteria({
      ...args,
      chain: args.chain || c,
      provider: args.provider || p,
    })
  },
})

/** Fetch a list of Tokens */
export const listTokens = queryField('listTokens', {
  type: list('HSToken'),
  args: { offset: intArg(), ids: list(stringArg()), ...chainIdentifierArgs() },
  async resolve(_, args) {
    const { offset } = args
    const opts = { ...args, offset: Math.max(offset || 0, 0) }
    return Tokens.getTokensList(opts as GetListOpts)
  },
})
