import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { noOp } from '@reach-sh/humble-sdk'
import arrowDownSVG from 'assets/arrow-down.svg'
import { GlobalUser } from 'state/reducers/user'
import { clearGlobalModal } from 'state/reducers/modals'
import { Token } from 'types/shared'
import { truncateAccountString } from 'utils/reach'
import { COLORS } from 'theme'
import FlexContainer, { ActionStep } from 'components/Common/FlexContainer'
import ModalComponent from 'components/Modals/ModalComponent'
import ImageLoader from 'components/Common/ImageLoader'
import { ModalPoolItem, PoolAddressLink } from 'components/Modals/Modals.Shared'
import { RemoveLqData } from 'components/Liquidity/RemoveLiquidity'
import CryptoIcon from 'components/Common/CryptoIcon'

const ArrowDown = styled(ImageLoader).attrs({ height: 32, width: 32 })`
  display: block;
  filter: 'dark-sage-svg-filter';
  margin: 1.4rem auto 0.4rem;
`

const GrayText = styled.span`
  color: ${COLORS.DMMidGray};
`

const H6 = styled.h6`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.65rem;
`

const Container = styled.div`
  padding: 0 24px;
`
const DescLabel = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  line-height: 1.1rem;
  margin-bottom: 2.5rem;
  margin-top: 0.8rem;
  text-align: center;
`

const TRANSFER = t`Withdraw V2 liquidity and separately deposit into a V3 pool.`
const WITHDRAW = t`Withdraw your V2 liquidity using a smart contract`

/** Migration Modal props */
export type ConfirmMigrateWithdrawProps = {
  open: boolean
  modalTitle?: string
  data: MigrateWithdrawData
  variant: 'withdraw' | 'transfer'
  onConfirm?: (...args: any[]) => any
  onClose?: (...args: any[]) => any
}

type MigrateWithdrawData = RemoveLqData & {
  tokenA: Token
  tokenB: Token
  oldPoolId: string
  newPoolId?: string
}

/** Confirm v2 Liquidity withdrawal or migration to v3 pool  */
const ConfirmMigrateWithdrawModal = (props: ConfirmMigrateWithdrawProps) => {
  const { walletAddress } = GlobalUser.getState()
  const {
    open,
    variant,
    onClose = clearGlobalModal,
    onConfirm = noOp,
    data,
    modalTitle = 'Confirm Action',
  } = props
  const { tokenA, tokenB, oldPoolId, newPoolId, tokenAAmount, tokenBAmount } =
    data
  const desc = variant === 'transfer' ? TRANSFER : WITHDRAW
  const step2Css = variant === 'withdraw' && { marginBottom: '1.5rem' }

  return (
    <ModalComponent
      modalTitle={modalTitle}
      cancellationText={t`Back`}
      confirmationText={t`Continue`}
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <Container>
        <DescLabel>{desc}</DescLabel>

        <H6>V2 Pool</H6>
        <ActionStep columns='repeat(2, 1fr)'>
          <ModalPoolItem tokA={tokenA} tokB={tokenB} />
          <PoolAddressLink id={oldPoolId} />
        </ActionStep>

        {walletAddress && (
          <>
            <ArrowDown src={arrowDownSVG} />
            <H6>
              <Trans>You</Trans>{' '}
              <GrayText>({truncateAccountString(walletAddress)})</GrayText>
            </H6>
            <ActionStep columns='repeat(2, 1fr)' style={step2Css || undefined}>
              <FlexContainer>
                <CryptoIcon id={tokenA?.id} symbol={tokenA?.symbol} />
                {tokenAAmount}
              </FlexContainer>
              <FlexContainer>
                <CryptoIcon id={tokenB?.id} symbol={tokenB?.symbol} />
                {tokenBAmount}
              </FlexContainer>
            </ActionStep>
          </>
        )}

        {variant === 'transfer' && newPoolId && (
          <>
            <ArrowDown src={arrowDownSVG} />
            <H6>V3 Pool</H6>
            <ActionStep
              columns='repeat(2, 1fr)'
              style={{ marginBottom: '1.5rem' }}
            >
              <ModalPoolItem tokA={tokenA} tokB={tokenB} />
              <PoolAddressLink id={newPoolId} />
            </ActionStep>
          </>
        )}
      </Container>
    </ModalComponent>
  )
}

export default ConfirmMigrateWithdrawModal
