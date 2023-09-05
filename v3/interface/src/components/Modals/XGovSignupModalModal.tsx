import styled from 'styled-components'
import { t } from '@lingui/macro'
import { noOp } from '@reach-sh/humble-sdk'
import { clearGlobalModal } from 'state/reducers/modals'
import { ActionStep } from 'components/Common/FlexContainer'
import { AlgoCommitmentOpts } from 'components/XGovs/ExpertGovs.Utils'
import { GoToAlgoExplorer } from 'components/Common/WalletAddressHelpers'
import CryptoIconPair from 'components/Common/CryptoIconPair'
import ModalComponent from 'components/Modals/ModalComponent'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalUser from 'hooks/useGlobalUser'
import { getTokenById } from 'helpers/pool'
import { truncateAccountString } from 'utils/reach'
import GenericImageModal from './GenericImageModal'

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

/** Migration Modal props */
export type XGovSignupModalProps = {
  open: boolean
  data: AlgoCommitmentOpts
  variant?: 'confirm' | 'success'
  onConfirm?: (...args: any[]) => any
  onClose?: () => any
}

/** Confirm v2 Liquidity withdrawal or migration to v3 pool  */
const XGovSignupModalModal = (props: XGovSignupModalProps) => {
  const { walletAddress } = useGlobalUser()
  const { pools } = useGlobalDex()
  const { open, onConfirm = noOp, data, variant = 'confirm', onClose } = props
  const { commitAlgo, gov, commitLP = [] } = data
  const desc = 'Make sure your entries are in order!'
  const close = () => {
    if (onClose) onClose()
    else clearGlobalModal()
  }
  const renderLPTokenItem = (d: string) => {
    const pool = pools.find((p) => p.poolTokenId === d)
    if (!pool) return <></>

    const [A, B] = [getTokenById(pool.tokAId), getTokenById(pool.tokBId)]
    return (
      <CryptoIconPair
        showText={window.innerWidth >= 300}
        firstTokId={A?.id}
        firstTokSymbol={A?.symbol}
        secondTokId={B?.id}
        secondTokSymbol={B?.symbol}
      />
    )
  }
  const Content = (
    <Container>
      {variant === 'confirm' && (
        <>
          <DescLabel>{desc}</DescLabel>
          <H6>Expert Governor (that&apos;s you!)</H6>
          <ActionStep columns='auto; margin-bottom: 1rem'>
            {truncateAccountString(gov)}
          </ActionStep>
        </>
      )}

      <H6>Algo Commitment</H6>
      <ActionStep columns='auto; margin-bottom: 1rem'>{commitAlgo}</ActionStep>

      {commitLP.length > 0 && (
        <>
          <H6>LP Commitments</H6>
          {commitLP.map(([id, amt]) => (
            <ActionStep key={id} columns='70% 30%; margin-bottom: 0.5rem;'>
              {renderLPTokenItem(id)}
              <b>{amt}</b>
            </ActionStep>
          ))}
        </>
      )}

      {variant === 'success' && (
        <>
          <GoToAlgoExplorer walletAddress={walletAddress} />
          <p>
            Check the <b>Text</b> field of your latest <b>0-ALGO</b> transaction
          </p>
        </>
      )}
    </Container>
  )

  return variant === 'confirm' ? (
    <ModalComponent
      modalTitle='Confirm xGov Commitment'
      cancellationText={t`Back`}
      confirmationText={t`Continue`}
      open={open}
      onClose={clearGlobalModal}
      onConfirm={onConfirm}
    >
      {Content}
    </ModalComponent>
  ) : (
    <GenericImageModal
      title='You committed to xGov!'
      cancellationText={t`Back`}
      open={open}
      onClose={close}
      onConfirm={close}
    >
      {Content}
    </GenericImageModal>
  )
}

export default XGovSignupModalModal
