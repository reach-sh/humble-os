/* eslint-disable react/destructuring-assignment */
import styled from 'styled-components'
import {
  SwapInfo,
  LimitOrderStatus,
  LimitOrderCore,
  LimitOrderAction,
} from 'types/shared'
import TokenSwapSummary from 'components/Common/TokenSwapSummary'
import { COLORS } from 'theme'
import { capitalizeFirstLetter } from 'utils/input'
import { formatUnsafeInt, minimumReceived } from 'reach/utils'
import { defaultDecimals } from 'helpers/getReach'
import FlexContainer from 'components/Common/FlexContainer'
import { t, Trans } from '@lingui/macro'
import { statusColor } from 'components/LimitOrder/LimitOrderStatusView'
import { LIMIT_ORDER } from 'constants/messages'
import SwapSummary, { LimitOrderSummary } from 'components/Swap/Summary'

const Wrapper = styled.div`
  padding: 24px;
`
const Notice = styled.div`
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
`
const Asterisk = styled.span`
  color: ${COLORS.errorRed};
`
const StatusContainer = styled(FlexContainer)`
  gap: 2rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`
const StatusLabel = styled.div<{ status: LimitOrderStatus }>`
  border: 1px solid ${({ status }) => statusColor(status)};
  border-radius: 47px;
  padding: 5px 10px;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 0.05em;
  color: ${({ status }) => statusColor(status)};
`
const Confirm = ({ tokA, tokB, amtA, amtB }: SwapInfo) => (
  <Wrapper>
    {tokA && tokB && (
      <TokenSwapSummary
        tokA={tokA}
        tokB={tokB}
        amtA={amtA.toString()}
        amtB={amtB.toString()}
      />
    )}
    <Notice>
      <Asterisk>*</Asterisk>Output is estimated.
    </Notice>
    <SwapSummary {...{ tokA, tokB, amtA, amtB }} />
  </Wrapper>
)

export default Confirm

type ConfirmLimitOrderProps = {
  showEstimateWarning?: boolean
  order: LimitOrderCore
  action?: LimitOrderAction
}

export const ConfirmOrder = ({
  action,
  showEstimateWarning: estimate = true,
  order,
}: ConfirmLimitOrderProps) => {
  const { amtA, amtB, tokA, tokB, delta, status } = order
  const minReceived = formatUnsafeInt(
    minimumReceived(amtB).toString(),
    defaultDecimals(tokB?.decimals),
  )
  const deltaStr = `${Math.abs(Number(delta) || 0)}`
  const diffPct = formatUnsafeInt(deltaStr, 2)
  const flat = Number(Number(delta).toFixed(4))
  const desc = () => {
    if (flat === 0 || !tokB) return ''
    const { RATE_HIGH, RATE_LOW } = LIMIT_ORDER
    const val = flat > 0 ? RATE_HIGH.replace('%TOKN%', tokB?.symbol) : RATE_LOW
    return val.replace('%DIFF%', `${diffPct}%`)
  }

  return (
    <Wrapper>
      {!estimate && (
        <StatusContainer>
          <div>{t`Status:`}</div>
          <StatusLabel status={status ?? 'open'}>
            {capitalizeFirstLetter(status)}
          </StatusLabel>
        </StatusContainer>
      )}

      {tokA && tokB && (
        <TokenSwapSummary
          tokA={tokA}
          tokB={tokB}
          amtA={amtA.toString()}
          amtB={amtB.toString()}
        />
      )}

      {estimate && (
        <Notice>
          <Asterisk>*</Asterisk>
          <Trans>
            Output is estimated. You will receive at least{' '}
            {`${minReceived} ${tokB?.symbol?.toUpperCase()}`} or the transaction
            will revert.
          </Trans>
        </Notice>
      )}

      <LimitOrderSummary {...order} />

      <Notice>
        {desc()}&nbsp;
        {!action && (
          <Trans>
            The order will be executed when market conditions are favorable.
          </Trans>
        )}
        {action === 'fill' && (
          <Trans>
            The order will be executed if market conditions are favorable.
          </Trans>
        )}
      </Notice>
    </Wrapper>
  )
}
