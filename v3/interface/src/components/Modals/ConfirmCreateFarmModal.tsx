import styled, { css } from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { noOp } from '@reach-sh/humble-sdk'
import WarningModal from './WarningModal'

const fontCSS = css`
  font-family: Lato;
  font-style: normal;
`
const ContentContainer = styled.div`
  background: ${({ theme }) => theme.colors.walletWarningBg};
  border-radius: 1em;
  padding: 0 16px 32px;
  width: 26.25em;
  overflow: hidden;

  * {
    position: relative;
  }
`
const Subheading = styled.h3.attrs({ className: 'h5' })`
  ${fontCSS}
  color: ${({ theme }) => theme.colors.walletWarningText};
  margin-top: 1rem;
  text-align: left;
  width: 100%;
`

type Props = {
  open: boolean
  onConfirm: () => any
  onClose: () => void
}

export default function ConfirmCreateFarmModal({
  open,
  onConfirm = noOp,
  onClose,
}: Props) {
  const width = Math.min(window.innerWidth, 420)

  return (
    <WarningModal
      open={open}
      width={width}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <ContentContainer>
        <Subheading>1. {t`Minimum stake`}</Subheading>

        <p>
          <Trans>
            To complete the Yield Farm creation process, you will stake&nbsp;
            <strong>1 of the staking token</strong>&nbsp; into the farm. We
            recommend leaving this stake for the duration of the farm.
          </Trans>
        </p>

        <Subheading>2. {t`Save your farm URL!`}</Subheading>
        <p>
          <Trans>
            At the end of this process, you will receive a URL with your
            farm&apos;s contract ID. It is a quick way to get to your farm. Save
            it carefully:&nbsp;
            <b>the app will only provide this link once.</b>
          </Trans>
        </p>
      </ContentContainer>
    </WarningModal>
  )
}
