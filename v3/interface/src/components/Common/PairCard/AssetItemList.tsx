import { Token } from 'types/shared'
import { filterTokensByQuery } from 'helpers/pool'
import { useReach } from 'helpers/getReach'
import { formatCurrency } from 'reach/utils'
import { getMinBalance } from 'helpers/user'
import cacheReducer from 'state/cacheReducer'
import sortBy from 'lodash.sortby'
import { GlobalUser } from 'state/reducers/user'
import AssetItem from '../AssetItem'

type AssetListProps = {
  data: Token[]
  selectedId?: number | string
  showBalance?: boolean
  onAddCustom?: (asset: Token) => void
  onItemSelect?: (asset: Token) => void
}

const noOp = (...args: any[]) => args

const AssetItemList = ({
  data,
  selectedId,
  showBalance = true,
  onItemSelect = noOp,
  onAddCustom = noOp,
}: AssetListProps) => {
  const { balanceOf } = useReach()
  const isSelected = ({ id }: Token) => id === selectedId
  const sorted = sortBy(data, (tk) => Number(tk.balance || '0')).reverse()
  const handleAddCustom = async (id: any) => {
    const { reachAccount } = GlobalUser.getState()
    const [token] = filterTokensByQuery(`${id}`, data)
    if (!token) return
    const balance = await balanceOf(reachAccount, token.id)
    const newToken = {
      ...token,
      balance: formatCurrency(balance, token.decimals),
      custom: true,
      minBalance: await getMinBalance(token.id, reachAccount),
    } as Token

    cacheReducer.tokens.update(newToken)
    onAddCustom(newToken)
  }

  return (
    <>
      {sorted.map((asset) => (
        <AssetItem
          key={`token-list-${asset.id}`}
          onClick={() => onItemSelect(asset)}
          handleAddCustom={handleAddCustom}
          showBalance={showBalance}
          selected={isSelected(asset)}
          {...asset}
        />
      ))}
    </>
  )
}

export default AssetItemList
