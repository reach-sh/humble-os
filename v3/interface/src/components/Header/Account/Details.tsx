import styled from 'styled-components'
import { truncateAccountString } from 'utils/reach'
import Popover from 'components/Common/Popover'
import { COLORS } from 'theme'
import {
  GoToAlgoExplorer,
  CopyAddress,
} from 'components/Common/WalletAddressHelpers'
import useGlobalUser from 'hooks/useGlobalUser'
import WalletIcon from 'components/Common/WalletIcon'
import NetworkProviderView from 'components/NetworkProvider/NetworkProviderView'
import SIZE from 'constants/screenSizes'
import { useWallet } from '@txnlab/use-wallet'
import { Skeleton } from '@mui/material'
import Disconnect from './Disconnect'
// import BuyAlgoButton from '../BuyAlgoButton'

const AccountContainer = styled.div`
  .sendwyre {
    display: none;
  }

  @media screen and (max-width: ${SIZE.sm}) {
    .sendwyre {
      display: inline-flex;
    }
  }
`
const AccountHeader = styled.div`
  color: ${COLORS.lightGray};
  display: flex;
  align-items: center;
`
const AccountAddress = styled.p`
  font-weight: 600;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  margin-left: 3px;
  color: ${({ theme }) => theme.colors.text};
`

const HR = styled.hr`
  border: 0;
  padding: 0.125rem 0;
`
const StyledGoToAlgo = styled(GoToAlgoExplorer)`
  margin-bottom: 1.5rem;
`
const StyledCopyAddress = styled(CopyAddress)`
  margin-bottom: 1.5rem;
`
const AccountInfo = ({
  open,
  handleClose,
}: {
  open: boolean
  handleClose: () => void
}) => {
  const { activeAccount } = useWallet()
  const { walletAddress, nfdWalletAddress } = useGlobalUser([
    'walletAddress',
    'nfdWalletAddress',
  ])
  const walletDisplay =
    nfdWalletAddress ||
    (walletAddress ? truncateAccountString(walletAddress) : null)
  return (
    <Popover open={open} handleClose={handleClose}>
      <AccountContainer>
        <AccountHeader style={{ color: COLORS.lightGray }}>
          {activeAccount ? (
            <WalletIcon iconName={activeAccount.providerId} />
          ) : (
            <Skeleton variant='circular' height={40} width={40} />
          )}
          <AccountAddress>{walletDisplay}</AccountAddress>
        </AccountHeader>
        <StyledCopyAddress walletAddress={walletAddress} />
        <StyledGoToAlgo walletAddress={walletAddress} />
        <HR />
        {/* <BuyAlgoButton onClick={handleClose} /> */}
        <NetworkProviderView condensed />
        <Disconnect />
      </AccountContainer>
    </Popover>
  )
}

export default AccountInfo
