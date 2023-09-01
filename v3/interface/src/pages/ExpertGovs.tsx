import styled from 'styled-components'
import Card from 'components/Common/Card'
import PageContainer from 'components/PageContainer'
import { createReachAPI } from '@reach-sh/humble-sdk'
import useGlobalUser from 'hooks/useGlobalUser'
import { ExLinkWithIcon } from 'components/Common/ExternalLink'
import AlgoWalletNotFound from 'components/AlgoWalletNotFound'
import {
  AlgoCommitmentOpts,
  xgovCommitTxn,
} from 'components/XGovs/ExpertGovs.Utils'
import ExpertGovsForm from 'components/XGovs/ExpertGovs.Form'
import XGovSignupModalModal, {
  XGovSignupModalProps,
} from 'components/Modals/XGovSignupModalModal'
import useGlobalModal from 'hooks/useGlobalModal'
import { clearGlobalModal, GlobalModal, MODAL } from 'state/store'
import { useState } from 'react'
import useToast from 'hooks/useToast'

const HeroDescription = styled.p`
  margin-bottom: 2.2rem;
`

type XGovModalVariant = XGovSignupModalProps['variant']

export default function ExpertGovs() {
  const { launchToast } = useToast()
  const { modal } = useGlobalModal()
  const { walletAddress } = useGlobalUser(['walletAddress'])
  const [commitments, setCommitments] = useState<AlgoCommitmentOpts>()
  const [modalVariant, setModalVariant] = useState<XGovModalVariant>('confirm')
  // clear transaction modal
  const clearModal = () => {
    setCommitments(undefined)
    clearGlobalModal()
  }
  // Send transaction to chain
  const completeSignup = async () => {
    if (!commitments) return
    const p = await createReachAPI().getProvider()
    const txn = xgovCommitTxn(commitments)

    const msg = { message: 'Commiting to xGovs' }
    const id = launchToast('progress', msg)
    await p.signAndPostTxns([txn])
    // 1.5s delay so user can find txn in Algoexplorer, because txn resolves quickly
    setTimeout(() => {
      msg.message = 'Transaction complete!'
      launchToast('success', msg, id, { autoClose: 5000 })
      setModalVariant('success')
    }, 1500)
  }
  // Show confirm-transaction modal
  const confirmSignup = async (opts: AlgoCommitmentOpts) => {
    setCommitments(opts)
    GlobalModal.active(MODAL.CONFIRM_XGOV)
  }

  return walletAddress ? (
    <PageContainer type='limitOrder'>
      <Card
        className='slide-down-fade-in'
        title='Algorand Expert Governors'
        padded
      >
        <HeroDescription>
          The <b>Algorand Expert Governors program</b> (also known as&nbsp;
          <b>xGovs</b>) was announced in 2022. Learn more about it&nbsp;
          <ExLinkWithIcon
            title='xGov: an Expert Governors System for Algorand'
            href='https://www.algorand.foundation/news/xgov-expert-governors-system'
          >
            here.
          </ExLinkWithIcon>
          In order to enroll, a governor needs to sign up for the current
          governance period and specify the <b>xGov escrow address</b> as the
          beneficiary. Everything else is identical to the regular governance
          program.
        </HeroDescription>

        {/* Form */}
        <ExpertGovsForm
          onSubmit={confirmSignup}
          data={commitments}
          onChange={setCommitments}
        />
      </Card>

      {/* Confirm + Success Modal */}
      {commitments && (
        <XGovSignupModalModal
          open={modal === MODAL.CONFIRM_XGOV}
          data={commitments}
          onConfirm={completeSignup}
          variant={modalVariant}
          onClose={clearModal}
        />
      )}
    </PageContainer>
  ) : (
    <PageContainer type='limitOrder'>
      <AlgoWalletNotFound />
    </PageContainer>
  )
}
