import Add from 'components/Liquidity/AddLiquidity'
import useGlobalUser from 'hooks/useGlobalUser'
import AlgoWalletNotFound from 'components/AlgoWalletNotFound'

function AddToPool(): JSX.Element {
  const { walletAddress } = useGlobalUser()
  return walletAddress ? <Add /> : <AlgoWalletNotFound />
}

export default AddToPool
