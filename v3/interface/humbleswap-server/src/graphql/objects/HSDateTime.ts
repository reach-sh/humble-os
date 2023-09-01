import { Kind } from 'graphql'
import { DateTime } from 'luxon'
import { scalarType } from 'nexus'

export const HSDateTime = scalarType({
  name: 'HSDateTime',
  asNexusMethod: 'date',
  description: 'UTC Date-time',

  parseLiteral(lit) {
    if (lit.kind === Kind.INT)
      return DateTime.fromMillis(Number(lit.value)).toUTC().toJSDate()
    if (lit.kind === Kind.STRING)
      return DateTime.fromISO(lit.value).toUTC().toJSDate()
    return null
  },

  parseValue(value) {
    return typeof value === 'string'
      ? DateTime.fromJSDate(new Date(value)).toUTC().toString()
      : null
  },

  serialize(value) {
    return (value as any)?.toString()
  },
})
