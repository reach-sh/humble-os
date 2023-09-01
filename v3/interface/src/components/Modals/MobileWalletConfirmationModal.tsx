import { useTheme } from 'contexts/theme'
import { useState } from 'react'
import manNoBeardBlackBg from 'assets/man_no_beard_black_bg.png'
import manWithBeardBlackBg from 'assets/man_with_beard_black_bg.png'
import womanWithSmileBlackBg from 'assets/woman_with_smile_black_bg.png'
import womanWithSmirkBlackBg from 'assets/woman_with_smirk_black_bg.png'
import manNoBeardWhiteBg from 'assets/man_no_beard_white_bg.png'
import manWithBeardWhiteBg from 'assets/man_with_beard_white_bg.png'
import womanWithSmileWhiteBg from 'assets/woman_with_smile_white_bg.png'
import womanWithSmirkWhiteBg from 'assets/woman_with_smirk_white_bg.png'
import styled from 'styled-components'
import { COLORS } from 'theme'
import useDidMountEffect from 'hooks/useDidMountEffect'
import ModalComponent from 'components/Modals/ModalComponent'

const blackBg = [
  manNoBeardBlackBg,
  manWithBeardBlackBg,
  womanWithSmileBlackBg,
  womanWithSmirkBlackBg,
]

const whiteBg = [
  manNoBeardWhiteBg,
  manWithBeardWhiteBg,
  womanWithSmileWhiteBg,
  womanWithSmirkWhiteBg,
]

function random(length: number) {
  return Math.floor(Math.random() * length)
}

const StyledImage = styled.img`
  width: 327px;
  height: auto;
`

const Waiting = styled.p`
  font-size: 18px;
  font-weight: bold;
  line-height: 22px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.sizes.xs};
`

const Action = styled.p`
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: ${COLORS.midGray};
  margin-bottom: ${({ theme }) => theme.sizes.xlg};
`

const Confirm = styled.p`
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.sizes.xxlg};
`

type Actions =
  | 'swapping'
  | 'adding'
  | 'removing'
  | 'creating'
  | 'staking'
  | 'unstaking'
  | 'claiming'
  | 'optingIn'

type Props = {
  open: boolean
  onClose: () => void
  action: Actions
  tokenAAmt: string
  tokenASymbol: string
  tokenBAmt?: string
  tokenBSymbol?: string
}

export default function MobileWalletConfirmationModal({
  open,
  onClose,
  action,
  tokenAAmt,
  tokenASymbol,
  tokenBAmt,
  tokenBSymbol,
}: Props) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const [image, setImage] = useState<string>(randomlyPickImage(isDarkMode))

  // To make sure flipping the theme doesn't mess up the image.
  useDidMountEffect(() => {
    setImage(randomlyPickImage(isDarkMode))
  }, [isDarkMode])

  return (
    <ModalComponent
      modalTitle={actionTitle(action)}
      onClose={onClose}
      open={open}
    >
      <>
        <StyledImage src={image} />
        <Waiting>Waiting for confirmation</Waiting>
        <Action>
          {actionText(action, tokenAAmt, tokenASymbol, tokenBAmt, tokenBSymbol)}
        </Action>
        <Confirm>Confirm transaction(s) in your mobile wallet</Confirm>
      </>
    </ModalComponent>
  )
}

function actionTitle(action: Actions) {
  const title = 'Confirm'
  const labels = {
    adding: `${title} adding liquidity`,
    claiming: `${title} Claiming`,
    creating: `${title} creating pool`,
    optingIn: `${title} Opting-In`,
    removing: `${title} removing liquidity`,
    staking: `${title} Staking`,
    swapping: `${title} swap`,
    unstaking: `${title} Unstaking`,
  }

  return labels[action] || ''
}

function actionText(
  action: Actions,
  tokenAAmt: string,
  tokenASymbol: string,
  tokenBAmt?: string,
  tokenBSymbol?: string,
) {
  const labelA = `${tokenAAmt} ${tokenASymbol}`
  const labelB = `${tokenBAmt || ''} ${tokenBSymbol || ''}`.trim()
  const labels = {
    adding: `Adding ${labelA} and ${labelB}`,
    get claiming() {
      const b = labelB ? (tokenAAmt ? `and ${labelB}` : labelB) : ''
      return `Claiming ${tokenAAmt ? `${labelA} ` : ''} ${b}`.trim()
    },
    creating: `Creating pool with ${labelA} and ${labelB}`,
    optingIn: `Opting-in to ${tokenASymbol}`,
    removing: `Withdrawing ${labelA} and ${labelB}`,
    staking: `Staking ${labelA} liquidity token`,
    swapping: `Swapping ${labelA} to ${labelB}`,
    unstaking: `Unstaking ${labelA} liquidity token`,
  }

  return labels[action] || ''
}

function randomlyPickImage(isDarkMode: boolean) {
  const index = random(4)
  return isDarkMode ? blackBg[index] : whiteBg[index]
}
