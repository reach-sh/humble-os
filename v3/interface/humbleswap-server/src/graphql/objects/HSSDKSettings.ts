import { objectType } from 'nexus'

/**
 * Current or versioned SDK announcer settings. Shows default announcer
 * contracts being used by the server
 */
export const HSSDKSettings = objectType({
  name: 'HSSDKSettings',
  description: 'Active (or legacy) SDK settings',
  definition(t) {
    t.nonNull.field('version', { type: 'HSSDKVersion' })
    t.nonNull.string('environment')
    t.nonNull.string('partnerFarmAnnouncerId')
    t.nonNull.string('protocolAddress')
    t.nonNull.string('protocolId')
    t.nonNull.string('publicFarmAnnouncer')
  },
})
