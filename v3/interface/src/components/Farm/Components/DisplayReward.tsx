import styled from 'styled-components'
import { currencyDisplaySymbol, getPrice } from 'prices'
import { truncateText } from 'utils/input'
import Tooltip from 'components/Common/Tooltip'
import LoadingSkeleton from 'components/Common/LoadingSkeleton'

const DisplayRewardContainer = styled.div`
  cursor: pointer;
`
type DisplayRewardProps = {
  connector: string
  priceUnit: string
  rewardTokenAmt: string
  rewardTokenId: string
  loading: boolean
}

const DisplayReward = ({
  connector,
  priceUnit,
  rewardTokenAmt,
  rewardTokenId,
  loading,
}: DisplayRewardProps) => {
  const value = getPrice(rewardTokenId, rewardTokenAmt)
  const displaySymbol = currencyDisplaySymbol(priceUnit)
  const isNetworkToken = displaySymbol === connector

  const formattedPrice = isNetworkToken
    ? `≈ ${value} ${displaySymbol}`
    : `≈${displaySymbol} ${value}`

  return (
    <LoadingSkeleton
      loading={loading}
      width={40}
      height='100%'
      borderRadius={9}
    >
      <DisplayRewardContainer>
        <Tooltip message={formattedPrice}>
          {truncateText(rewardTokenAmt.toString(), 7)}
        </Tooltip>
      </DisplayRewardContainer>
    </LoadingSkeleton>
  )
}

export default DisplayReward
