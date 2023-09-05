import styled from 'styled-components'
import { useMemo } from 'react'
import { formatNumberShort } from '@reach-sh/humble-sdk'
import { Trans } from '@lingui/macro'
import { useTheme } from 'contexts/theme'
import { COLORS } from 'theme'

import CryptoIcon from 'components/Common/CryptoIcon'
import { GoToAlgoExplorer } from 'components/Common/WalletAddressHelpers'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import Button from 'components/Common/Button'
import Tooltip from 'components/Common/Tooltip'
import BallonsPng from 'assets/success.png'
import FingersZeroPng from 'assets/remove-liquidity.png'
import BallonsPngDark from 'assets/success-dark.png'
import FingersZeroPngDark from 'assets/remove-liquidity-dark.png'
import { Token } from 'types/shared'
import useGlobalUser from 'hooks/useGlobalUser'
import ModalComponent from './ModalComponent'

const BoxContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.toolTipBackground};
  border-radius: 8px;
  max-width: 350px;
  padding: 24px 40px;
  margin-bottom: 20px;
`

const RowContainer = styled.div`
  display: flex;
  > div:last-of-type {
    span:first-child {
      text-overflow: ellipsis;
    }
  }
`

type SpanProps = {
  highlight?: boolean
  fontSize?: number
  fontWeight?: number
  marginSides?: boolean
  dark?: boolean
}
const Span = styled.span<SpanProps>`
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  color: ${({ dark, highlight }) =>
    highlight ? COLORS.yellow : dark ? COLORS.white : COLORS.black};
  margin: 0px ${({ marginSides }) => (marginSides ? '12' : '0')}px;
`
const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
  max-height: 38px;
`
const GoAlgoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 44px;
  padding-left: 48px;
`
const ModalContent = styled(FlexColumnContainer)`
  padding: 16px;
`
const ImageContainer = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: center;
`
const Image = styled.img`
  width: 200px;
  height: 200px;
`
const CloseButton = styled(Button)`
  width: 100%;
  height: 54px;
  background: ${COLORS.yellow};
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
`
const RemoveLiquidityButton = styled(Button)`
  width: 100%;
  height: 54px;
  border: 1px solid ${({ theme }) => theme.colors.toolTipBackground};
  background: ${({ theme }) => theme.colors.altButtonActiveText};
  color: ${({ theme }) => theme.colors.altButtonActive};
  margin-top: 1rem;
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
`
type PoolBoxDataProps = {
  additionalInfo?: string
  amount?: string
  mode?: 'liquidity' | 'stake' | 'createPool' | 'claim'
  rewardGovTokenAmount?: number
  rewardTokenAmount?: number
  rewardTokenIcon?: string
  tokenAAmount: number
  tokenAIcon: string
  tokenAId: string | number
  tokenBAmount?: number
  tokenBIcon?: string
  tokenBId?: string | number
}

const PoolLiquidityInfo = ({
  additionalInfo,
  amount = '0',
  mode,
  rewardGovTokenAmount,
  rewardTokenAmount,
  rewardTokenIcon,
  tokenAAmount,
  tokenAIcon,
  tokenAId,
  tokenBAmount,
  tokenBIcon,
  tokenBId,
}: PoolBoxDataProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const amountFmt = formatNumberShort(amount, 4)

  return (
    <BoxContainer>
      {mode !== 'claim' && (
        <>
          <RowContainer>
            <IconContainer>
              <CryptoIcon symbol={tokenAIcon} id={tokenAId} size={24} />
              {tokenBIcon && (
                <CryptoIcon symbol={tokenBIcon} id={tokenBId ?? 0} size={24} />
              )}
            </IconContainer>
            <IconContainer>
              <Tooltip
                message={amount}
                disable={amount === undefined}
                size='medium'
              >
                <Span dark={isDarkMode} data-testid='success-modal-amount'>
                  {amountFmt}
                </Span>
              </Tooltip>
            </IconContainer>
          </RowContainer>
          <RowContainer>
            <Span
              fontSize={16}
              dark={isDarkMode}
              data-testid='success-modal-token-description'
            >
              {tokenBIcon
                ? `${tokenAIcon}/${tokenBIcon} Pool Tokens`
                : `${tokenAIcon} Token`}
            </Span>
          </RowContainer>
        </>
      )}
      {mode !== 'stake' && (
        <RowContainer>
          <Span
            fontSize={12}
            fontWeight={400}
            dark={isDarkMode}
            data-testid='success-modal-token-A'
          >
            {mode === 'claim'
              ? `${rewardGovTokenAmount} ALGO`
              : `${tokenAAmount} ${tokenAIcon}`}
          </Span>
          <Span fontSize={12} marginSides dark={isDarkMode}>
            +
          </Span>
          <Span
            fontSize={12}
            fontWeight={400}
            dark={isDarkMode}
            data-testid='success-modal-token-B'
          >
            {mode === 'claim'
              ? `${rewardTokenAmount} ${rewardTokenIcon}`
              : `${tokenBAmount} ${tokenBIcon}`}
          </Span>
        </RowContainer>
      )}
      {additionalInfo && <RowContainer>{additionalInfo}</RowContainer>}
    </BoxContainer>
  )
}

interface SuccessModalProps {
  additionalInfo?: string
  amount?: string
  image: 'add' | 'remove'
  mode?: 'liquidity' | 'stake' | 'createPool' | 'claim'
  showRemoveLiquidityButton?: boolean
  onClose: () => void
  onClickRemoveLiquidity?: () => void
  open: boolean
  rewardGovTokenAmt?: number
  rewardTokenAmt?: number
  rewardTokenSymbol?: string
  title: string
  tokenA: Token
  tokenAAmount: number
  tokenB?: Token
  tokenBAmount?: number
}

const SuccessPoolModal = ({
  additionalInfo,
  amount,
  image,
  mode,
  showRemoveLiquidityButton = false,
  onClose,
  onClickRemoveLiquidity: onRemoveLiquidity,
  open,
  rewardGovTokenAmt,
  rewardTokenAmt,
  rewardTokenSymbol,
  title,
  tokenA,
  tokenAAmount,
  tokenB,
  tokenBAmount,
}: SuccessModalProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const { walletAddress } = useGlobalUser(['walletAddress'])
  const [addImage, removeImg] = useMemo(
    () =>
      isDarkMode
        ? [BallonsPngDark, FingersZeroPngDark]
        : [BallonsPng, FingersZeroPng],
    [theme],
  )
  const imageSrc = image === 'add' ? addImage : removeImg

  return (
    <ModalComponent
      open={open}
      modalTitle={title}
      width={420}
      onClose={onClose}
      sticky={false}
    >
      <ModalContent>
        <ImageContainer>
          <Image src={imageSrc} />
        </ImageContainer>

        <PoolLiquidityInfo
          additionalInfo={additionalInfo}
          amount={amount}
          mode={mode}
          rewardGovTokenAmount={rewardGovTokenAmt}
          rewardTokenAmount={rewardTokenAmt}
          rewardTokenIcon={rewardTokenSymbol}
          tokenAAmount={tokenAAmount}
          tokenAIcon={tokenA.symbol}
          tokenAId={tokenA.id}
          tokenBAmount={tokenBAmount}
          tokenBIcon={tokenB?.symbol}
          tokenBId={tokenB?.id}
        />

        <GoAlgoContainer>
          <GoToAlgoExplorer walletAddress={walletAddress} />
        </GoAlgoContainer>

        <CloseButton
          onClick={onClose}
          data-testid='pool-creation-success-modal-close-btn'
        >
          <Trans>Close</Trans>
        </CloseButton>

        {showRemoveLiquidityButton && (
          <RemoveLiquidityButton
            onClick={onRemoveLiquidity}
            data-testid='pool-creation-success-modal-remove-liquidity-btn'
          >
            <Trans>Remove Liquidity</Trans>
          </RemoveLiquidityButton>
        )}
      </ModalContent>
    </ModalComponent>
  )
}

export default SuccessPoolModal
