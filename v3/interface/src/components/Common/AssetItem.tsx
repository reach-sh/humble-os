import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import useGlobalDex from 'hooks/useGlobalDex'
import { formatCurrency, parseCurrency, truncateNum } from 'reach/utils'
import { COLORS } from 'theme'
import { AssetSymbolProps } from 'types/shared'
import CryptoIcon from './CryptoIcon'
import FlexContainer, { FlexColumnContainer } from './FlexContainer'
import AssetItemSymbol from './AssetItemSymbol'
import RemoveAssetButton from './RemoveAssetButton'
import AddCustomToken from './AddAssetButton'

type AssetItemProps = {
  balance?: number | string
  showBalance?: boolean
  custom?: boolean
  empty?: boolean
  name?: string
  disabled?: boolean
  decimals?: number
  id?: string | number
  handleAddCustom?: (id: string | number) => any
} & AssetSymbolProps &
  React.ComponentPropsWithRef<'div'>

const Container = styled(FlexContainer)<{
  disabled?: boolean
}>`
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  justify-content: space-between;
  min-height: 4.24rem;
  padding: 0 ${({ theme }) => theme.sizes.sm};
  transition: background 0.1s ease-out;
  &:hover {
    background: ${({ theme }) => theme.colors.popoverBg};
  }

  @media screen and (max-width: 600px) {
    padding: 0;
  }
`
const AssetInfoContainer = styled(FlexColumnContainer)`
  align-items: flex-start;
  flex-grow: 1;
  min-width: 200px;
  padding: ${({ theme }) => theme.sizes.sm};
  padding-right: 0;

  @media screen and (max-width: 600px) {
    min-width: 160px;
  }
`
const AssetName = styled.span<{ bold?: boolean }>`
  color: #6c9688;
  display: inline-block;
  font-size: smaller;
  font-weight: ${({ bold }) => (bold ? 'bolder' : 'normal')};
  line-height: ${({ theme }) => theme.sizes.md};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  white-space: nowrap;
`
const AssetId = styled.span`
  background-color: ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.sizes.xxs};
  color: ${COLORS.milk};
  font-size: 10px;
  padding-left: ${({ theme }) => theme.sizes.xxs};
  padding-right: ${({ theme }) => theme.sizes.xxs};
  width: auto;
`
const Balance = styled.span`
  font-size: small;
  text-align: right;
`
const CustomFlag = styled.span`
  color: ${({ theme }) => theme.colors.main};
`
const SelectPrompt = styled(Container)<{
  disabled?: boolean
}>`
  color: ${({ theme }) => theme.colors.text};
  flex-grow: 1;
`
const AssetItem = (props: AssetItemProps) => {
  const {
    balance,
    custom,
    showBalance = true,
    children,
    empty,
    name = '',
    onClick = () => null,
    handleAddCustom = () => null,
    selected,
    symbol = '',
    disabled,
    decimals,
    id,
  } = props

  const { tokenBalancesLoading } = useGlobalDex(['tokenBalancesLoading'])
  const currencyBalance = parseCurrency(balance || 0, decimals)
  const formattedBalance = truncateNum(
    formatCurrency(currencyBalance, decimals),
    decimals,
  )
  const handleClick = () => {
    if (!disabled) onClick()
  }

  return (
    <>
      {empty ? (
        <SelectPrompt onClick={handleClick}>
          <Trans>Select a token:</Trans>
        </SelectPrompt>
      ) : (
        <Container disabled={disabled} onClick={handleClick}>
          {children || (
            <>
              {/* Symbol */}
              <CryptoIcon size={24} symbol={symbol} id={id || ''} />

              {/* Name, Id */}
              <AssetInfoContainer data-testid={`token-${name}`}>
                <AssetItemSymbol selected={selected} symbol={symbol} />
                <AssetName>
                  <span>{name}</span>
                  {custom && <CustomFlag>&nbsp;| Added by you</CustomFlag>}
                </AssetName>
                {id !== '0' && <AssetId>{`ID: ${id}`}</AssetId>}
              </AssetInfoContainer>

              {/* Balance */}
              {showBalance ? (
                <>
                  {tokenBalancesLoading ? (
                    <span className='spinner--before' />
                  ) : (
                    <Balance data-testid={`token-${name}-balance`}>
                      {formattedBalance}
                    </Balance>
                  )}

                  {/* Delete button */}
                  {custom && <RemoveAssetButton assetId={id} />}
                </>
              ) : (
                <AddCustomToken onAddToken={handleAddCustom} assetId={id} />
              )}
            </>
          )}
        </Container>
      )}
    </>
  )
}

export default AssetItem
