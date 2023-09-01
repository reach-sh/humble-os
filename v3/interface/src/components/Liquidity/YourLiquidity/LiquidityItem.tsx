/* eslint-disable react/destructuring-assignment */
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { useTheme } from 'contexts/theme'
import { Pool } from 'types/shared'
import CryptoIcon from 'components/Common/CryptoIcon'
import { getOwnershipOfPool, getTokenById } from 'helpers/pool'
import { HSGTagEvent, sendGoogleTagEvent } from 'helpers/googleAnalytics'
import SIZE from 'constants/screenSizes'
import { paths } from 'App.routes'
import { LinkAsButton } from 'components/Common/Button'
import Icon, { IconWrapper } from 'components/Common/Icon'
import { COLORS } from 'theme'
import { useIsMobile } from 'hooks/useScreenSize'
import SymbolAndBadge from 'components/Farm/SymbolAndBadge'
import { NETWORKS } from 'constants/reach_constants'
import { getBlockchain } from '@reach-sh/humble-sdk'
import { getLPTokensPrice } from 'prices'
import { GlobalUser } from 'state/reducers/user'
import { t } from '@lingui/macro'

type CellType = {
  row?: number
  column?: number
  rowEnd?: number
  columnEnd?: number
  borderRight?: boolean
  padRight?: boolean
}

const ellipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Cell = styled.div<CellType>`
  grid-row: ${({ row }) => row || 1};
  grid-column: ${({ column }) => column || 1};
  grid-row-end: ${({ rowEnd }) => rowEnd || 'auto'};
  grid-column-end: ${({ columnEnd }) => columnEnd || 'auto'};
  border-right: ${({ borderRight }) =>
    borderRight ? `1px solid ${COLORS.lightGray}` : 'none'};
  padding-right: ${({ padRight }) => (padRight ? '24px' : 'none')};

  @media screen and (max-width: ${SIZE.xs}) {
    &.sop-label {
      grid-column: 2 / end;
    }
  }
`

const MainContainer = styled.div<{ expanded: boolean }>`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.cardContentBg};
  border-radius: ${({ expanded }) => (expanded ? '8px 8px 0 0' : '8px')};
  margin-top: 10px;
  display: grid;
  grid-template-columns: 0.8fr 2.8fr repeat(1, 2fr) 0.4fr;
  grid-template-rows: repeat(2, 0.8fr);

  /* mobile grid */
  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: 0.4fr 1.2fr 1.2fr 1.2fr;
    grid-template-rows: 0.8fr repeat(2, 1.2fr) 0.8fr;
  }
`

const ExpandedWrapper = styled.div`
  padding: 0 1rem 1rem 1rem;
  background: ${({ theme }) => theme.colors.cardContentBg};
  border-radius: 0 0 8px 8px;
`
const ExpandedContainer = styled.div`
  display: grid;
  row-gap: 8px;
  border-top: 1px solid ${COLORS.lightGray};
  grid-template-columns: 0.8fr 2.8fr repeat(3, 2fr) 0.4fr;
  grid-template-rows: repeat(2, 1fr);
`
const Icons = styled(Cell).attrs({ column: 1, rowEnd: 3 })`
  align-items: center;
  display: flex;
  height: 100%;

  @media (max-width: ${SIZE.sm}) {
    align-items: flex-start;
    margin-right: 8px;
  }
`

const PoolName = styled.div`
  ${ellipsis}
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  overflow: visible;

  @media (max-width: ${SIZE.sm}) {
    font-size: 14px;
  }

  display: flex;
  gap: 4px;
  align-items: center;
`
const TokenAmount = styled.p`
  ${ellipsis}
  font-size: 12px;
  line-height: 16px;

  @media (max-width: ${SIZE.sm}) {
    align-self: flex-end;
  }
`
const LiquidityTokAmount = styled.p`
  text-align: right;
  font-weight: bold;
  font-size: 16px;

  [class^='spinner--'] {
    place-content: end;
  }

  @media (max-width: ${SIZE.sm}) {
    justify-self: flex-end;
    font-size: 14px;
  }
`
const ShareText = styled.p<{ textAlign?: 'left' | 'center' | 'right' }>`
  font-size: 12px;
  text-align: ${({ textAlign }) => textAlign || 'right'};

  @media (max-width: ${SIZE.sm}) {
    grid-column: 2 / 3;
    grid-row: 3;
  }
`
const AddButton = styled(LinkAsButton)`
  background-color: ${({ theme }) => theme.colors.accent};
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 12px;
  height: 22px;
  transition: opacity 0.1s;
  width: 80px;

  &.black {
    background: ${COLORS.black};
    color: ${COLORS.white};
  }

  &.gradient {
    background: ${({ theme }) => theme.colors.v3Gradient};
    color: ${COLORS.black};
  }

  &:hover {
    opacity: 0.8;
  }
`
export const RemoveButton = styled(AddButton)`
  background-color: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.buttonText};
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const ShareNumber = styled.p`
  font-size: 12px;
  justify-self: center;
  text-align: right;

  @media (max-width: ${SIZE.sm}) {
    justify-self: flex-end;
    align-self: flex-end;
  }
`

const ExpandButtonCell = styled(Cell)`
  display: flex;
  flex-direction: column;
  align-content: flex-end;
`
const IconContainer = styled(Cell)`
  cursor: pointer;
`

const PoolTokensCell = styled(Cell)`
  display: flex;
  align-items: center;

  @media (max-width: ${SIZE.sm}) {
    align-items: flex-start;
  }
`

const SubText = styled.span<{ dark?: boolean }>`
  color: ${({ dark }) => (dark ? COLORS.DMMidGray : COLORS.white)};
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
`
const IDSContainer = styled.div`
  display: flex;
  gap: 4px;
`
const IDContainer = styled.div<{ dark?: boolean }>`
  padding: 0 4px;
  background-color: ${({ dark }) => (dark ? COLORS.darkSage : COLORS.sage)};
  border-radius: 4px;
`

const tokenID = (id: number | string, dark?: boolean) => (
  <IDContainer dark={dark}>
    <SubText dark={dark}>ID: {id}</SubText>
  </IDContainer>
)

type Props = {
  pool: Pool
  addText?: string
  removeText?: string
  altButtons?: boolean
  onAddLiquidity?: (p: Pool) => any
  onRemoveLiquidity?: (p: Pool) => any
}

// liquidity item
const LiquidityItem = (props: Props) => {
  const {
    pool,
    onAddLiquidity,
    onRemoveLiquidity,
    altButtons = false,
    addText = t`Add more`,
    removeText = t`Remove`,
  } = props
  const { search } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const adaptUI = (desktopValue: number, mobileValue: number) =>
    isMobile ? mobileValue : desktopValue

  const {
    tokAId,
    tokBId,
    tokABalance,
    tokBBalance,
    mintedLiquidityTokens,
    poolTokenId,
  } = pool
  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)
  const lp = getTokenById(poolTokenId)
  if (!(tokA && tokB)) return null

  const exp = 10 ** NETWORKS[getBlockchain()].decimals
  const liquidityAmount = Number(lp?.balance ?? 0) * exp
  const ownershipOfPool = getOwnershipOfPool(
    liquidityAmount,
    mintedLiquidityTokens,
  )
  const liquidityDefaultCurrency = useMemo(
    () => getLPTokensPrice(String(lp?.balance ?? 0), pool),
    [pool, liquidityAmount],
  )

  const calcPct = (n: number) => (liquidityAmount * n) / mintedLiquidityTokens
  const tokenADeposited = Math.min(calcPct(tokABalance), tokABalance)
  const tokenBDeposited = Math.min(calcPct(tokBBalance), tokBBalance)
  const isDark = theme === 'Dark'
  const expandedIcon = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
  const tagEvent = (event: HSGTagEvent) => {
    const { reachAccount } = GlobalUser.getState()
    sendGoogleTagEvent(event, reachAccount, search)
  }
  const onAddButtonClick = (e: any) => {
    if (onAddLiquidity) {
      e?.preventDefault()
      onAddLiquidity(pool)
    } else tagEvent('LIQUIDITY-Launch_Add_More')
  }
  const onRemoveButtonClick = (e: any) => {
    if (onRemoveLiquidity) {
      e?.preventDefault()
      onRemoveLiquidity(pool)
    } else tagEvent('LIQUIDITY-Launch_Remove')
  }

  if (Number(lp?.balance ?? 0) === 0) return null

  return (
    <>
      <MainContainer
        data-testid={`pool-liq-item-${tokA.symbol}-${tokB.symbol}`}
        expanded={expanded}
      >
        <Icons>
          <IconWrapper>
            <CryptoIcon symbol={tokA.symbol} id={tokA.id} />
          </IconWrapper>
          <IconWrapper>
            <CryptoIcon symbol={tokB.symbol} id={tokB.id} />
          </IconWrapper>
        </Icons>

        <PoolTokensCell column={2} columnEnd={4} rowEnd={3}>
          <PoolName>
            <SymbolAndBadge tokenAId={tokA.id} tokenBId={tokB.id} />
          </PoolName>
        </PoolTokensCell>
        <Cell
          column={adaptUI(3, 4)}
          padRight={!isMobile}
          borderRight={!isMobile}
        >
          <LiquidityTokAmount
            data-testid={`pool-liq-item-${tokA.symbol}-${tokB.symbol}-amt`}
          >
            {!lp?.balance ? <span className='spinner--before' /> : lp.balance}
          </LiquidityTokAmount>
        </Cell>

        <Cell
          row={2}
          column={adaptUI(3, 4)}
          padRight={!isMobile}
          borderRight={!isMobile}
        >
          <ShareText
            data-testid={`pool-liq-item-${tokA.symbol}-${tokB.symbol}-liquidity-default-currency`}
          >
            ≈{liquidityDefaultCurrency}
          </ShareText>
        </Cell>

        <Cell row={adaptUI(1, 4)} column={adaptUI(5, 3)} padRight={!isMobile}>
          <ButtonContainer>
            <AddButton
              className={altButtons ? 'gradient' : undefined}
              to={paths.pool.add(pool.poolAddr)}
              onClick={onAddButtonClick}
            >
              {addText}
            </AddButton>
          </ButtonContainer>
        </Cell>

        <Cell row={adaptUI(2, 4)} column={adaptUI(5, 4)} padRight={!isMobile}>
          <ButtonContainer>
            <RemoveButton
              className={altButtons ? 'black' : undefined}
              data-testid={`pool-liq-item-${tokA.symbol}-${tokB.symbol}-remove`}
              to={paths.pool.remove(pool.poolAddr)}
              onClick={onRemoveButtonClick}
            >
              {removeText}
            </RemoveButton>
          </ButtonContainer>
        </Cell>

        {isMobile ? (
          <>
            <Cell row={2} column={2} columnEnd={4}>
              <TokenAmount>
                {`${tokenADeposited.toFixed(5)} ${tokA.symbol}`}
                <span style={{ fontWeight: 'bold', margin: '0 4px' }}>+</span>
                {`${tokenBDeposited.toFixed(5)} ${tokB.symbol}`}
              </TokenAmount>
            </Cell>
            <Cell row={3} column={2} className='sop-label'>
              <ShareText textAlign='left'>Share of pool</ShareText>
            </Cell>
            <Cell row={3} column={4}>
              <ShareNumber style={{ fontWeight: 'bold' }}>
                {ownershipOfPool}%
              </ShareNumber>
            </Cell>
          </>
        ) : (
          <>
            <ExpandButtonCell row={2} column={6}>
              <IconContainer
                row={6}
                column={2}
                onClick={() => setExpanded(!expanded)}
              >
                <Icon iconType={expandedIcon} />
              </IconContainer>
            </ExpandButtonCell>
          </>
        )}
      </MainContainer>
      {expanded && !isMobile && (
        <ExpandedWrapper>
          <ExpandedContainer>
            <Cell row={3} columnEnd={4}>
              <TokenAmount>
                {`${tokenADeposited.toFixed(5)} ${tokA.symbol}`}
                <span style={{ fontWeight: 'bold', margin: '0 4px' }}>+</span>
                {`${tokenBDeposited.toFixed(5)} ${tokB.symbol}`}
              </TokenAmount>
            </Cell>

            <Cell row={4}>
              <IDSContainer>
                {tokenID(tokA.id, isDark)}
                {tokenID(tokB.id, isDark)}
              </IDSContainer>
            </Cell>

            <Cell row={3} column={5} padRight className='sop-label'>
              <ShareText textAlign='right'>Share of pool</ShareText>
            </Cell>

            <Cell row={4} column={5} padRight>
              <ShareNumber style={{ fontWeight: 'bold' }}>
                {ownershipOfPool}%
              </ShareNumber>
            </Cell>
          </ExpandedContainer>
        </ExpandedWrapper>
      )}
    </>
  )
}

export default LiquidityItem
