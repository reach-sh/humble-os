import styled from 'styled-components'
import { SubText, TokId } from './Button'
import CryptoIcon from './CryptoIcon'
import FlexContainer from './FlexContainer'
import TokenPrice from './PairCard/TokenPrice'

const Wrapper = styled.div<{ featured?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 10px 10px 0px 10px;
  min-height: 95px;
`

const AssetRow = styled(FlexContainer)`
  margin-top: -4px;
  ${TokId} {
    margin-right: 12px;
  }
`

const AssetName = styled.span`
  flex-grow: 1;
  font-size: 16px;
  font-weight: 700;
  padding-left: 8px;
  width: 50%;
`

const AmountLabel = styled.p`
  font-size: 35px;
  font-weight: 700;
`

const IconsWrapper = styled(FlexContainer)`
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.main};
  background: ${({ theme }) => theme.colors.main};
`

const Separator = styled.div`
  margin-top: 15px;
  border-top: ${({ theme }) => `1px solid ${theme.colors.inputSeparator}`};
`

type PoolTokenCardProps = {
  amount: string
  poolTokenId: string
  tokenAId: string
  tokenASymbol: string
  tokenBId: string
  tokenBSymbol: string
}

const PoolTokenCard = ({
  amount,
  poolTokenId,
  tokenAId,
  tokenASymbol,
  tokenBId,
  tokenBSymbol,
}: PoolTokenCardProps) => (
  <Wrapper>
    <AssetRow>
      <IconsWrapper>
        <CryptoIcon symbol={tokenASymbol} id={tokenAId} />
        <CryptoIcon symbol={tokenBSymbol} id={tokenBId} />
      </IconsWrapper>
      <AssetName>
        {tokenASymbol}/{tokenBSymbol}
      </AssetName>
      <AmountLabel>{amount}</AmountLabel>
    </AssetRow>
    <AssetRow>
      <SubText>
        {tokenASymbol}/{tokenBSymbol}
      </SubText>
      <TokenPrice tokenId={poolTokenId} tokenAmt={amount} />
    </AssetRow>
    <AssetRow>
      <TokId>ID: {tokenAId}</TokId>
      <TokId>ID: {tokenBId}</TokId>
    </AssetRow>
    <Separator />
  </Wrapper>
)

export default PoolTokenCard
