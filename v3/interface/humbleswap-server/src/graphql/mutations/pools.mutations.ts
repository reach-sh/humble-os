import { mutationField, nonNull, stringArg } from 'nexus'
import { chainIdentifierArgs } from '../utils'
import { refreshPool } from '../../reach/listener.pools'

const updateByIdArgs = {
  ...chainIdentifierArgs(),
  id: nonNull(stringArg()),
  tokenAId: nonNull(stringArg()),
  tokenBId: nonNull(stringArg()),
}

/**
 * Fallback: fetch latest pool data from the blockchain and write to db.
 * This should help if a user creates a pool after the listener fails.
 */
export const updatePool = mutationField('updatePool', {
  type: 'HSPool',
  args: updateByIdArgs,
  async resolve(_, args) {
    const { id, tokenAId, tokenBId } = args
    return refreshPool(id, tokenAId, tokenBId)
  },
})
