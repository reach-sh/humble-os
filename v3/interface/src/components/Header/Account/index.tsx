import styled from 'styled-components'
import { truncateAccountString } from 'utils/reach'
import { SyntheticEvent, useState } from 'react'
import useGlobalUser from 'hooks/useGlobalUser'
import AccountInfo from './Details'

const WalletContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  border: ${({ theme }) => `2px solid ${theme.colors.text}`};
  display: flex;
  align-items: center;
  transition: background 0.2s;
  padding: 6px 7px;
  margin-left: 10px;
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.colors.buttonHover};
    color: ${({ theme }) => theme.colors.textHover};
  }
  @media (max-width: 40em) {
    margin-left: 2px;
  }
`

const WalletAddressText = styled.p`
  font-weight: 600;
  padding-right: 4px;
  letter-spacing: 2px;
`

const Account = () => {
  const { walletAddress, nfdWalletAddress } = useGlobalUser()
  const [isViewingAccount, setAccountView] = useState(false)

  const handleWalletToggle = (e: SyntheticEvent) => {
    e.stopPropagation()
    setAccountView(!isViewingAccount)
  }

  const walletDisplay =
    nfdWalletAddress ||
    (walletAddress ? truncateAccountString(walletAddress) : null)

  return (
    <>
      <WalletContainer onMouseDown={handleWalletToggle}>
        <WalletAddressText>{walletDisplay}</WalletAddressText>
      </WalletContainer>
      <AccountInfo
        open={isViewingAccount}
        handleClose={() => setAccountView(false)}
      />
    </>
  )
}

export default Account
