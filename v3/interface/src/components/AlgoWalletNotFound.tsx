import { Trans } from '@lingui/macro'
import Card from 'components/Common/Card'
import SIZE from 'constants/screenSizes'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { useLocation } from 'react-router-dom'
import { GlobalModal, MODAL } from 'state/reducers/modals'
import styled from 'styled-components'
import Button from './Common/Button'
import { GridContainer } from './Common/FlexContainer'

const Container = styled(Card)`
  min-height: 70vh;
`
const Text = styled.p`
  padding-bottom: 1.5rem;
`
const ConnectButton = styled(Button).attrs({ type: 'button' })`
  font-weight: bold;
  font-size: 16px;
`
const Heading = styled(GridContainer).attrs({ columns: 'auto max-content' })``
const Title = styled.h4`
  font-size: 1.5rem;
  margin: 1.5rem 0;
  padding: 0;
  @media screen and (max-width: ${SIZE.md}) {
    padding: 0;
  }
`

export default function AlgoWalletNotFound(): JSX.Element {
  const { search } = useLocation()
  const onConnect = () => {
    sendGoogleTagEvent('CONNECT_WALLET-From_Liquidity', null, search)
    GlobalModal.active(MODAL.CONNECT_WALLET)
  }

  return (
    <Container padded>
      <Heading>
        <Title>
          <Trans>No Wallet found!</Trans>
        </Title>

        <ConnectButton onClick={onConnect}>
          <Trans>Connect Wallet</Trans>
        </ConnectButton>
      </Heading>

      <Text>
        <Trans>
          Please ensure you have at least one Wallet extension installed and
          enabled, and that you are signed in.
        </Trans>
      </Text>
    </Container>
  )
}
