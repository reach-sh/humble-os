import { t } from '@lingui/macro'
import { useTheme } from 'contexts/theme'
import { clearGlobalModal } from 'state/reducers/modals'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { Token } from 'types/shared'
import GenericImageModal from './GenericImageModal'
import {
  LargeText,
  ModalPoolItem,
  ModalText,
  PoolAddressLink,
  RowContainer,
} from './Modals.Shared'

const TRANSFER = t`Migration Complete!`
const WITHDRAW = t`Withdrawal Complete!`
const TRANSFER_DESC = t`Balance moved into V3 Pool:`
const WITHDRAW_DESC = t`You received:`

const HR = styled.hr.attrs({ className: 'expand--horizontal' })`
  border: 0;
  background-color: ${COLORS.midGray};
  height: 0.02rem;
  margin: 0.5rem 0;
`

/** Migration Modal props */
export type ConfirmMigrateWithdrawProps = {
  open: boolean
  tokenA?: Token
  tokenB?: Token
  newPoolId?: string
  amtA?: string
  amtB?: string
  variant: 'withdraw' | 'transfer'
  onClose?: (...args: any[]) => any
}

/** Notify of successful v2 Liquidity withdrawal or migration  */
const MigrateWithdrawSuccessModal = (props: ConfirmMigrateWithdrawProps) => {
  const {
    open,
    variant,
    onClose = clearGlobalModal,
    tokenA,
    tokenB,
    amtA = '1',
    amtB = '1',
    newPoolId,
  } = props
  const { theme } = useTheme()
  const title = variant === 'transfer' ? TRANSFER : WITHDRAW
  const partialTransfer = amtA !== '0' || amtB !== '0'
  const dark = theme === 'Dark'
  const Text = (children: string) => (
    <ModalText dark={dark} fontSize={12}>
      {children}
    </ModalText>
  )

  return (
    <GenericImageModal title={title} open={open} onClose={onClose}>
      {/* Amounts received */}
      {partialTransfer && (
        <>
          <LargeText dark={dark}>{WITHDRAW_DESC}</LargeText>
          <RowContainer columns='repeat(2, max-content)'>
            {amtA !== '0' && Text(`${amtA} ${tokenA?.symbol}`)}
            {amtB !== '0' && Text(`${amtB} ${tokenB?.symbol}`)}
          </RowContainer>
        </>
      )}

      {/* V3 Pool */}
      {newPoolId && variant === 'transfer' && (
        <>
          <HR />
          <LargeText dark={dark}>{TRANSFER_DESC}</LargeText>

          <RowContainer columns='repeat(2, max-content)'>
            <ModalPoolItem tokA={tokenA} tokB={tokenB} />
            <PoolAddressLink id={newPoolId} />
          </RowContainer>
        </>
      )}
    </GenericImageModal>
  )
}

export default MigrateWithdrawSuccessModal
