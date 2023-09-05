import PageContainer from 'components/PageContainer'
import LimitOrderForm from 'components/LimitOrder'
import LimitOrdersList from 'components/LimitOrder/LimitOrdersList'
import useGlobalUser from 'hooks/useGlobalUser'
import { useEffect } from 'react'
import { GlobalDex } from 'state/store'

/** `Limit Orders` page */
const Swap = () => {
  const { walletAddress } = useGlobalUser()

  // clear any selected actions and orders when the page unloads
  useEffect(
    () => () =>
      GlobalDex.multiple({
        selectedLimitOrderAction: undefined,
        selectedLimitOrderInfo: undefined,
      }),
    [],
  )

  return (
    <PageContainer type='swap' hasTutorial>
      <LimitOrderForm />
      {walletAddress && <LimitOrdersList />}
    </PageContainer>
  )
}

export default Swap
