import { inputObjectType, stringArg } from 'nexus'

export type PaginationArgs = {
  page?: number
  limit?: number
  orderBy?: string
  descending?: boolean
}

export const InputPaginationArgs = {
  id: stringArg(),
  creator: stringArg(),
  pagination: 'PaginationInput',
}

/** Additional options for paginating db results */
export const PaginationInput = inputObjectType({
  name: 'PaginationInput',
  nonNullDefaults: {
    input: true,
    output: true,
  },
  definition(t) {
    t.int('page', { default: 1 })
    t.int('limit', { default: 50 })
    t.string('orderBy', { default: 'id' })
    t.boolean('descending', { default: false })
  },
})
