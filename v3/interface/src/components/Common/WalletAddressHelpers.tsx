import { CURRENT_PROVIDER, PROVIDERS } from 'constants/reach_constants'
import { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { copyToClipboard } from 'utils/input'
import PopoutIcon from './PopoutIcon'

const GreenText = styled.p`
  font-weight: 600;
  color: ${COLORS.darkSage};
  &:hover {
    cursor: pointer;
  }
`

const CopyMessage = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 200;
  margin-left: 1rem;
`

interface AddressProps {
  walletAddress: string | undefined | null
}

export const GoToAlgoExplorer = ({ walletAddress }: AddressProps) => {
  const goToAlgoExplorer = () =>
    window.open(
      `https://${
        CURRENT_PROVIDER === PROVIDERS.MAINNET
          ? ''
          : `${CURRENT_PROVIDER.toLowerCase()}.`
      }algoexplorer.io/address/${walletAddress}`,
      '_blank',
    )

  return (
    <GreenText onClick={goToAlgoExplorer}>
      View on AlgoExplorer <PopoutIcon />
    </GreenText>
  )
}

export const CopyAddress = ({ walletAddress }: AddressProps) => {
  const [didCopy, setCopy] = useState(false)

  const copyAddress = async () => {
    await copyToClipboard(walletAddress as string)
    setCopy(true)
    setTimeout(() => setCopy(false), 2000)
  }

  return (
    <GreenText onClick={copyAddress}>
      Copy Address {didCopy && <CopyMessage>Copied!</CopyMessage>}
    </GreenText>
  )
}
