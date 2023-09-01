import { objectType } from 'nexus'

export const HSVersions = objectType({
  name: 'HSVersions',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('version')
    t.nonNull.string('protocolId') // pool announcer Id
    t.nonNull.string('partnerFarmAnnouncer')
    t.nonNull.string('publicFarmAnnouncer')
    t.nonNull.string('limitOrderAnnouncer')
  },
})
