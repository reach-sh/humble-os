import { useMemo, useState } from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components'
import { ColumnLabel, LabelHeading, StyledInput } from 'components/Common/Form'
import { GridContainer } from 'components/Common/FlexContainer'
import TokenSelector from 'components/Common/PairCard/TokenSelector'
import useGlobalDex from 'hooks/useGlobalDex'
import { Token } from 'types/shared'
import filterDupPoolsByAntiquity from 'utils/pool'
import { sortByBigNumberBalance } from 'helpers/pool'
import Button from 'components/Common/Button'
import { COLORS } from 'theme'
import { FarmTokenFormData } from 'reach/bridge/FarmAdmin'
import { USDC } from 'constants/default-tokens'

type CreateFarmTokenProps = {
  onFarmTokens: (stakeToken: FarmTokenFormData) => Promise<void>
  rewardTokenId: string | undefined
}

const TokenIdInput = styled(StyledInput).attrs({ readOnly: true })`
  cursor: pointer;
`
const TokenTypeTriggers = styled(GridContainer)`
  width: 100%;
`
const TokenType = styled(Button).attrs({
  type: 'button',
  size: 'sm',
  outline: true,
})`
  background-color: transparent;
  border: 1px solid;
  color: ${COLORS.darkSage};
  transition: backround 180ms ease-out;

  &:hover {
    background-color: ${COLORS.darkSage};
    color: ${COLORS.black};
  }
`

enum TOKENS {
  POOL = 'Pool (LP) Tokens',
  OTHER = 'Non-LP Tokens',
}

const CreateFarmTokens = ({
  onFarmTokens,
  rewardTokenId,
}: CreateFarmTokenProps) => {
  const { tokenList, ltBalancesLoading, pools } = useGlobalDex([
    'tokenList',
    'ltBalancesLoading',
    'pools',
  ])
  const [stakeToken, setStakeToken] = useState<Token>()
  const [selectingToken, setSelectingToken] = useState(false)
  const [tokenType, setTokenType] = useState(TOKENS.POOL)
  const changeTokenListType = (type: TOKENS) => {
    setTokenType(type)
    setSelectingToken(true)
  }
  const triggers = [
    { text: 'Pool Tokens', do: () => changeTokenListType(TOKENS.POOL) },
    { text: 'Other Tokens', do: () => changeTokenListType(TOKENS.OTHER) },
  ]

  const poolTokenIds: Set<string> = useMemo(() => {
    if (!pools.length) return new Set()
    const newPTIds = new Set<string>()
    filterDupPoolsByAntiquity(pools).forEach(({ poolTokenId }) =>
      newPTIds.add(poolTokenId),
    )
    return newPTIds
  }, [ltBalancesLoading])
  // Token lists
  const [poolTokens, otherTokens]: [Token[], Token[]] = useMemo(() => {
    const pts: Token[] = []
    const ots: Token[] = []
    const nonLPToken = ({ name = '' }: Token) =>
      !(name || '').startsWith('HUMBLE LP') &&
      !(name || '').startsWith('Tinyman') &&
      !(name || '').startsWith('Asset #')
    tokenList.forEach((tok) => {
      if (!tok) return
      if (poolTokenIds.has(tok.id.toString())) pts.push(tok)
      else if (tok.balance && nonLPToken(tok)) ots.push(tok)
    })
    return [sortByBigNumberBalance(pts), sortByBigNumberBalance(ots)]
  }, [tokenList, poolTokenIds])
  // Tokens List for selector modal
  const filteredTokensList: Token[] = useMemo(
    () => (tokenType === TOKENS.POOL ? poolTokens : otherTokens),
    [poolTokens, otherTokens, tokenType],
  )
  // (User-friendly) Name of selected token
  const stakeTokenName: string = useMemo(
    () => (stakeToken?.id ? `${stakeToken.name} (${stakeToken.id})` : ''),
    [stakeToken],
  )

  const handleToken = (tok: Token) => {
    setStakeToken(tok)
    onFarmTokens({ stakeTokenId: tok.id })
  }

  return (
    <fieldset>
      <LabelHeading>
        <Trans>1. Staking Token</Trans>
      </LabelHeading>

      <ColumnLabel>
        <p>
          <Trans>
            Which token will be staked in the farm? Select the token below.
          </Trans>
        </p>

        <TokenIdInput
          data-test='stake-token-input'
          placeholder={USDC()}
          value={stakeTokenName}
          aria-invalid={!!rewardTokenId && stakeToken?.id === rewardTokenId}
          onClick={() => setSelectingToken(true)}
        />

        <TokenTypeTriggers columns='repeat(2, 1fr)'>
          {triggers.map((trigger, i) => (
            <TokenType onClick={trigger.do} key={i}>
              {trigger.text}
            </TokenType>
          ))}
        </TokenTypeTriggers>
      </ColumnLabel>

      <TokenSelector
        isSelecting={selectingToken}
        tokenList={filteredTokensList}
        selected={stakeToken}
        setSelecting={() => setSelectingToken(false)}
        onTokenSelected={handleToken}
      />
    </fieldset>
  )
}

export default CreateFarmTokens
