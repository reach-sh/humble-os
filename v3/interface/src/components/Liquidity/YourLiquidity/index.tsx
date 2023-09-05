import { ReactNode, useMemo, useState } from 'react'
import Card from 'components/Common/Card'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { Pool } from 'types/shared'
import { RUNNING_TESTS } from 'constants/node'
import Button, { LinkWithButtonProps } from 'components/Common/Button'
import FlexContainer from 'components/Common/FlexContainer'
import Pagination from 'components/Common/Pagination'
import { paths } from 'App.routes'
import { MODAL, GlobalModal } from 'state/reducers/modals'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalDex from 'hooks/useGlobalDex'
import { EVENTS, LABELS, LIQUIDITY } from 'constants/messages'

const Container = styled(Card).attrs({ className: 'slide-down-fade-in' })`
  width: 100%;
`
const Content = styled.div`
  padding: 1.5rem;
  min-height: 188px;
  @media (max-width: ${SIZE.sm}) {
    padding: 0;
  }
`
const Heading = styled(FlexContainer)`
  justify-content: space-between;
  margin-bottom: 20px;
`
const Title = styled.h2`
  font-size: 24px;
  @media (max-width: ${SIZE.sm}) {
    font-size: 18px;
  }
`
const NoPoolMessage = styled(FlexContainer)`
  color: ${COLORS.midGray};
  font-size: 16px;
  margin-top: 28px;
  place-content: center;
`
const CreatePoolBtn = styled(LinkWithButtonProps)`
  background: ${COLORS.yellow};
  font-weight: bold;
  max-width: 208px;

  @media (max-width: ${SIZE.sm}) {
    max-width: 150px;
  }
`
const MigrateBtn = styled(Button)`
  margin-top: 0.8rem;
  width: 100%;
`
const ConnectWalletButton = styled(Button)`
  font-weight: bold;
  max-width: 208px;
  @media (max-width: ${SIZE.sm}) {
    max-width: 150px;
  }
`
// TODO: create a cypress command that goes through the pages looking for an
// element instead of just extending the list size
const defaultPageSize = RUNNING_TESTS ? 20 : 5

type Props = {
  pools: Pool[]
  pageSize?: number
  migration?: boolean
  renderListItem(data: Pool): ReactNode | ReactNode[]
}

const YourLiquidity = (props: Props) => {
  const {
    pools,
    pageSize = defaultPageSize,
    migration = false,
    renderListItem,
  } = props
  const { search } = useLocation()
  const [currentPage, setCurrentPage] = useState(0)
  const { connected, reachAccount } = useGlobalUser()
  const { ltBalancesLoading } = useGlobalDex(['ltBalancesLoading'])
  const navigate = useNavigate()
  const goToMigrate = () => navigate(paths.pool.migrate)
  const onPageClick = (newPage: number) => setCurrentPage(newPage)
  const onCreatePoolButtonClick = () =>
    sendGoogleTagEvent('LIQUIDITY-Launch_Create_Pool', reachAccount, search)
  const onConnectButtonClick = () => {
    sendGoogleTagEvent('CONNECT_WALLET-From_Liquidity', null, search)
    GlobalModal.active(MODAL.CONNECT_WALLET)
  }
  const [displayPools, showSpinner, loadingLq] = useMemo(() => {
    const lmsg = ltBalancesLoading ? EVENTS.LIQUIDITY_LOADING : LIQUIDITY.EMPTY
    return connected
      ? [pools.length > 0, ltBalancesLoading, lmsg]
      : [false, false, lmsg]
  }, [connected, pools, ltBalancesLoading])

  return (
    <Container>
      <Content>
        {/* Heading + Create Pool Button */}
        {!migration && (
          <Heading>
            <Title>
              <Trans>Your liquidity</Trans>
            </Title>
            {connected ? (
              <CreatePoolBtn
                to={paths.pool.new}
                onClick={onCreatePoolButtonClick}
              >
                <Trans>Create pool</Trans>
              </CreatePoolBtn>
            ) : (
              <ConnectWalletButton onClick={onConnectButtonClick}>
                Connect wallet
              </ConnectWalletButton>
            )}
          </Heading>
        )}

        {/* Liquidity List or empty message */}
        {displayPools ? (
          pools
            .slice(currentPage * pageSize, currentPage * pageSize + pageSize)
            .map(renderListItem)
        ) : (
          <NoPoolMessage>
            {showSpinner && <span className='spinner--before' />}
            <>{connected ? loadingLq : LABELS.CONNECT}</>
          </NoPoolMessage>
        )}

        {/* Migrate Liquidity Button */}
        {connected && !migration && (
          <MigrateBtn
            disabled={!connected}
            variant='accent'
            onClick={goToMigrate}
          >
            <Trans>Migrate V2 Liquidity</Trans>
          </MigrateBtn>
        )}

        {/* Pagination */}
        {displayPools && (
          <Pagination
            pagesLength={pools.length}
            pageSize={pageSize}
            onPageClick={onPageClick}
            currentPage={currentPage}
          />
        )}
      </Content>
    </Container>
  )
}

export default YourLiquidity
