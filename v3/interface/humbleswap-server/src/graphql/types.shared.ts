export type VestigeAPRVolumeData = {
  application_id: number
  apr7d?: number
  apr24h?: number
  asset_1_id: number | null
  asset_2_id: number | null
  fee: number
  id: number
  liquidity: number
  provider: string
  volume7d?: number
  volume24h?: number
}

export type PoolVolumeAPR = Map<string, VestigeAPRVolumeData>
