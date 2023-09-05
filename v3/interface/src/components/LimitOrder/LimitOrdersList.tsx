import { useMemo, useState } from 'react'
import styled from 'styled-components'
import Card from 'components/Common/Card'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalOrders from 'hooks/useGlobalOrders'
import useGlobalModal from 'hooks/useGlobalModal'
import Pagination from 'components/Common/Pagination'
import Toggle from 'components/Common/Toggle'
import { MODAL, clearGlobalModal } from 'state/reducers/modals'
import ModalComponent from 'components/Modals/ModalComponent'
import { ConfirmOrder } from 'components/Swap/Confirm'
import { t } from '@lingui/macro'
import LimitOrderCanceledModal from 'components/Modals/LimitOrderCanceledModal'
import SuccessOrderFilledModal from 'components/Modals/SuccessOrderFilledModal'
import { doCancelLimitOrder, doFillLimitOrder } from 'reach/api/trader'
import { LABELS } from 'constants/messages'
import { LimitOrderAction, Token } from 'types/shared'
import LimitOrderItem from './LimitOrderItem'
import { ListHeading, ListTitle } from './LimitOrders.Containers'
import LimitOrdersHeading from './LimitOrdersList.Heading'

const ContainerStyles = { margin: '1.25rem 0 2rem', padding: '2rem' }
const ListContainer = styled(Card).attrs({ style: ContainerStyles })`
  width: 100%;
`

enum TOGGLE_TYPE {
  OPEN = 'Open',
  CLOSED = 'History',
}

export const LimitOrdersList = () => {
  const [toggle, setToggle] = useState<TOGGLE_TYPE>(TOGGLE_TYPE.OPEN)
  const { modal } = useGlobalModal()
  const { reachAccount: account } = useGlobalUser()
  const { selectedLimitOrderInfo, selectedLimitOrderAction } = useGlobalDex([
    'selectedLimitOrderInfo',
    'selectedLimitOrderAction',
  ])
  const { limitOrders } = useGlobalOrders()
  // Pagination
  const pageSize = 5
  const [currentPage, setCurrentPage] = useState(0)
  const [showSuccess, setShowSuccess] = useState<LimitOrderAction>()
  const [pageStart, pageEnd] = useMemo(
    () => [currentPage * pageSize, (currentPage + 1) * pageSize],
    [currentPage],
  )
  const onPageClick = (next: number) => setCurrentPage(next)
  const [confirmationText, showOrderDetails] = useMemo(() => {
    const sd = Boolean(selectedLimitOrderInfo) && modal === MODAL.ORDER_DETAILS
    switch (selectedLimitOrderAction) {
      case 'fill':
        return [LABELS.FILL_ORDER, sd]
      default:
        return [LABELS.CANCEL_ORDER, sd]
    }
  }, [selectedLimitOrderInfo, modal])
  // Async handle limit order action
  const handleLimitOrder = async () => {
    clearGlobalModal()
    if (!selectedLimitOrderInfo?.contractId) return

    const res =
      selectedLimitOrderAction === 'close'
        ? await doCancelLimitOrder(account, selectedLimitOrderInfo)
        : await doFillLimitOrder(account, selectedLimitOrderInfo)
    if (res.succeded) setShowSuccess(selectedLimitOrderAction)
  }

  const filteredOrders = limitOrders.filter((o) =>
    toggle === TOGGLE_TYPE.OPEN
      ? !o.status || o.status === 'open'
      : o.status === 'closed',
  )
  const toggleOrdersType = () => {
    const { OPEN, CLOSED } = TOGGLE_TYPE
    setToggle(toggle === OPEN ? CLOSED : OPEN)
    setCurrentPage(0)
  }

  return (
    <ListContainer>
      <ListHeading>
        <ListTitle>Your Orders</ListTitle>
        <Toggle
          active={toggle}
          posText={TOGGLE_TYPE.OPEN}
          negText={TOGGLE_TYPE.CLOSED}
          onToggleClick={toggleOrdersType}
        />
      </ListHeading>

      <LimitOrdersHeading />

      {filteredOrders.slice(pageStart, pageEnd).map((o) => (
        <LimitOrderItem {...o} key={`lo-${o.contractId}`} />
      ))}

      <Pagination
        pagesLength={filteredOrders.length}
        pageSize={pageSize}
        onPageClick={onPageClick}
        currentPage={currentPage}
      />

      {showSuccess && (
        <>
          <LimitOrderCanceledModal
            open={showSuccess === 'close'}
            onClose={() => setShowSuccess(undefined)}
            token={selectedLimitOrderInfo?.tokA}
            amount={selectedLimitOrderInfo?.amtA}
          />

          <SuccessOrderFilledModal
            open={showSuccess === 'fill'}
            onClose={() => setShowSuccess(undefined)}
            amtB={selectedLimitOrderInfo?.amtB}
            tokenB={selectedLimitOrderInfo?.tokB as Token}
          />
        </>
      )}

      {selectedLimitOrderInfo && (
        <ModalComponent
          open={showOrderDetails}
          width={420}
          modalTitle={t`Order Details`}
          confirmationText={confirmationText}
          hideCancelBtn
          onClose={clearGlobalModal}
          onConfirm={handleLimitOrder}
        >
          <ConfirmOrder
            order={selectedLimitOrderInfo}
            action={selectedLimitOrderAction}
            showEstimateWarning={false}
          />
        </ModalComponent>
      )}
    </ListContainer>
  )
}

export default LimitOrdersList
