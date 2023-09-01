import { makeSchema } from 'nexus'
import { join } from 'path'
import * as types from './graphql-nexus-types'

export const schema = makeSchema({
  // Data classes (used to generate SDL types)
  types,

  // Directory where nexus-generated files go
  outputs: {
    typegen: join(__dirname, 'schema', 'nexus-typegen.ts'),
    schema: join(__dirname, 'schema', 'schema.graphql'),
  },

  // Context file source
  contextType: {
    export: 'GQLContext',
    module: join(__dirname, 'context.ts'),
  },
})
