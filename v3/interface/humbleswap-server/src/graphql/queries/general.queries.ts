import { DateTime } from 'luxon'
import { nonNull, queryField, stringArg } from 'nexus'
import { blockTimeToISO, getServerEnvironment } from '../utils'
import { globalReachAddress } from '../services/Reach.service'
import crypto from 'crypto'
import {
  BASE_VERSION,
  getBlockchain,
  getLegacyAnnouncers,
} from '@reach-sh/humble-sdk'

/** Convert a block number to a timestamp */
export const convertBlockToDate = queryField('convertBlockToDate', {
  type: 'String',
  args: {
    blockNumber: nonNull(stringArg()),
    format: stringArg(),
  },
  async resolve(_, { blockNumber, format }) {
    const iso = await blockTimeToISO(blockNumber)
    const dt = DateTime.fromISO(iso)
    return dt.isValid
      ? dt.toFormat(format || 'ff')
      : 'Invalid blockNumber or date'
  },
})

/** List protocol (default and/or other) contracts used by SDK */
export const listAnnouncerContracts = queryField('listAnnouncers', {
  type: 'HSSDKSettings',
  args: {
    version: nonNull(stringArg({ default: BASE_VERSION })),
    env: nonNull(stringArg({ default: getServerEnvironment() })),
  },
  async resolve(_, { version, env }) {
    const vs = version as 'v2' | 'v3'
    const ev = env as keyof ReturnType<typeof getLegacyAnnouncers>
    const announcers = getLegacyAnnouncers(vs)
    if (!announcers) return null

    return {
      version: vs,
      environment: ev,
      protocolAddress: announcers[ev].protocolAddress.toString(),
      protocolId: announcers[ev].protocolId.toString(),
      partnerFarmAnnouncerId: announcers[ev].partnerFarmAnnouncerId.toString(),
      publicFarmAnnouncer: announcers[ev].publicFarmAnnouncer.toString(),
      limitOrderAnnouncer: announcers[ev].limitOrderAnnouncer.toString(),
    }
  },
})

/** Get the account `address` used by the current `reach` service instance */
export const getSDKAddress = queryField('getSDKAddress', {
  type: 'String',
  args: { auth: nonNull(stringArg()) },
  async resolve(_, { auth }) {
    if (auth !== process.env.AGN_TOKEN) return 'UNAUTHORIZED'
    return globalReachAddress()
  },
})

/** Create a signed moonpay URL */
export const signMoonpayUrl = queryField('signMoonpayUrl', {
  type: 'String',
  args: {
    walletAddress: nonNull(stringArg()),
    amount: nonNull(stringArg()),
    currency: nonNull(stringArg()),
  },
  async resolve(_, { walletAddress, amount, currency }) {
    const moonpayPubKey = process.env.MOONPAY_PUBLIC_KEY
    const moonpaySecretKey = process.env.MOONPAY_SECRET_KEY

    // NOTE: Moonpay doesn't support algo on test mode
    const currencyCode = getBlockchain().toLowerCase()
    const apiUrl = process.env.MOONPAY_API_URL
    const originalUrl = `${apiUrl}?apiKey=${moonpayPubKey}&currencyCode=${currencyCode}&walletAddress=${walletAddress}&baseCurrencyCode=${currency}&baseCurrencyAmount=${amount}`

    const signature = crypto
      .createHmac('sha256', moonpaySecretKey || '')
      .update(new URL(originalUrl).search)
      .digest('base64')

    const urlWithSignature = `${originalUrl}&signature=${encodeURIComponent(
      signature,
    )}`

    return urlWithSignature
  },
})
