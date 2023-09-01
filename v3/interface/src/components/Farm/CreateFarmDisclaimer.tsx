/* eslint-disable max-len */
import { useState } from 'react'
import { t, Trans } from '@lingui/macro'
import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import ModalComponent from 'components/Modals/ModalComponent'
import Checkbox from 'components/Common/Checkbox'
import Button from 'components/Common/Button'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 62px 12px;
  @media screen and (max-width: ${SIZE.sm}) {
    padding: 8px 20px 12px;
  }
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  line-height: 38px;
`

const DisclaimerBox = styled.div<{ dark: boolean }>`
  background: ${({ dark }) => (dark ? COLORS.DMMidGray : COLORS.milk)};
  border-radius: 18px;
  border: 1px solid ${({ dark }) => (dark ? COLORS.white : COLORS.black)};
  padding: 22px;
  h5 {
    color: ${COLORS.yellow};
    font-size: 14px;
    font-weight: 700;
  }
  p {
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 18px;
    strong {
      font-weight: 800;
    }
  }
`

const StyledButton = styled(Button)`
  font-size: 20px;
  font-weight: 700;
  height: 62px;
`

interface CreateFarmDisclaimerProps {
  onClose: () => void
  open: boolean
}

const CreateFarmDisclaimer = ({ onClose, open }: CreateFarmDisclaimerProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const [isAccepted, setIsAccepted] = useState(false)
  return (
    <ModalComponent
      background={isDarkMode ? COLORS.black : COLORS.darkCream}
      kind='noClose'
      open={open}
      width={622}
    >
      <ModalContent>
        <Title>{t`Before proceeding, please read the instructions below carefully.`}</Title>
        <DisclaimerBox dark={isDarkMode}>
          <h5>{t`Management`}</h5>
          <p>
            <Trans>
              The creation of Yield Farms is managed by smart contracts.
              Therefore,{' '}
              <strong>
                the only way to terminate a Yield Farm is to fulfill its
                duration.
              </strong>{' '}
              Remember to review the completion of all fields as many times as
              necessary.
            </Trans>
          </p>
          <h5>{t`Initial Requirements`}</h5>
          <p>
            <Trans>
              Farm Rewards will be issued even if there are no stakes in your
              Farm Yield. Rewards issued without stakes will result in a
              permanent loss of these values. To prevent this,{' '}
              <strong>
                you will be required to make a minimum initial stake once the
                farm is created.
              </strong>{' '}
              We recommend that you keep your starting stake for the entire
              duration of the rewards issuance period.
            </Trans>
          </p>
          <h5>{t`Issue rewards`}</h5>
          <p>
            <Trans>
              Rewards are issued per block on the Algorand blockchain.{' '}
              <strong>
                If your rewards token has zero decimal places, your total reward
                must be greater than the number of blocks in the duration of the
                farm.
              </strong>
            </Trans>
          </p>
        </DisclaimerBox>
        <Checkbox onChange={(e) => setIsAccepted(e.target.checked)}>
          <div>{t`I have carefully read and understood the instructions.`}</div>
        </Checkbox>
        <StyledButton
          disabled={!isAccepted}
          onClick={onClose}
        >{t`Continue`}</StyledButton>
      </ModalContent>
    </ModalComponent>
  )
}

export default CreateFarmDisclaimer
