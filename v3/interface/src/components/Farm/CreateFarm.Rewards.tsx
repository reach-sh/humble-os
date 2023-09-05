import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { Token } from 'types/shared'
import { getCurrentNetwork } from 'helpers/getReach'
import { sortByBigNumberBalance } from 'helpers/pool'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalUser from 'hooks/useGlobalUser'
import filterDupPoolsByAntiquity from 'utils/pool'
import SIZE from 'constants/screenSizes'
import {
  CollapsibleGrid,
  FlexColumnContainer,
} from 'components/Common/FlexContainer'
import { ColumnLabel, LabelHeading, StyledInput } from 'components/Common/Form'
import TokenInput from 'components/Common/PairCard/TokenInput'
import TokenSelector from 'components/Common/PairCard/TokenSelector'
import Checkbox from 'components/Common/Checkbox'
import { PROMPTS } from 'constants/messages'
import { USDC } from 'constants/default-tokens'
import { FarmRewardsData } from './CreateFarmForm.Validate'

const HUMBLE_LP_TOKEN_SYMBOL = 'HMBL2LT'
const TokenIdInput = styled(StyledInput).attrs({ readOnly: true })`
  cursor: pointer;
`

const columns = 'calc(65% - 0.75rem) 35%'
const Grid = styled(CollapsibleGrid).attrs({ columns })`
  align-items: flex-end;
`

const SelectRewards = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 10px;
  @media screen and (max-width: ${SIZE.lg}) {
    flex-direction: column;
  }
`

const Box = styled.div`
  background-color: ${({ theme }) => theme.colors.inputActiveBg};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;
  padding: 10px;
`

const Rewards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`

const CheckboxLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
`
const CheckboxContainer = styled(FlexColumnContainer)`
  justify-content: center;
  height: 2.4rem;
  margin: 0.4rem;
`

const RewardsSelector = ({
  selectedTokenReward,
  onRewardCheck,
}: {
  selectedTokenReward: Token | undefined
  onRewardCheck: (
    rwd: string,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const network = getCurrentNetwork()
  const rewardsList = [network, 'other']
  return (
    <SelectRewards>
      {rewardsList.map((rewardToken) => {
        const tokenName =
          rewardToken === network
            ? network
            : selectedTokenReward?.name || rewardToken
        return (
          <Box key={`id-${rewardToken}`}>
            <Checkbox onChange={onRewardCheck(rewardToken)}>
              <CheckboxLabel>{`Payout ${tokenName} rewards`}</CheckboxLabel>
            </Checkbox>
          </Box>
        )
      })}
    </SelectRewards>
  )
}

type CreateFarmRewardsProps = {
  isPublicFarm: boolean
  onRewardsChange: (rewards: FarmRewardsData) => Promise<void>
  onSelectReward: (reward: string, checked: boolean) => void
  ownNetworkTokens: number
  showNetworkReward: boolean
  showTokenReward: boolean
  stakeTokenId: string | undefined
}

const ProtocolFunder = () =>
  'HUM5WSLZVWG62WJKPZ4MQEUD2OREWBQ4WOWFAD5IDAB5W7BJS5JSWCSIBI'

const CreateFarmRewards = ({
  isPublicFarm,
  onRewardsChange,
  onSelectReward,
  ownNetworkTokens,
  showNetworkReward,
  showTokenReward,
  stakeTokenId,
}: CreateFarmRewardsProps) => {
  const { walletAddress } = useGlobalUser(['walletAddress'])
  const { tokenList, ltBalancesLoading, pools } = useGlobalDex([
    'tokenList',
    'ltBalancesLoading',
    'pools',
  ])
  const [poolTokenIds, setPoolTokenIds] = useState<string[]>([])
  const [networkRewardAmt, setNetworkRewardAmt] = useState('')
  const [selectToken, setSelectToken] = useState(false)
  const [selectedTokenReward, setSelectedTokenReward] = useState<Token>()
  const [tokenRewardAmt, setTokenRewardAmt] = useState('')
  const initialFunder = isPublicFarm ? walletAddress || '' : ProtocolFunder()
  const [funder, setFunder] = useState(initialFunder)
  const [enableFunderAddress, setEnableFunderAddress] = useState(false)
  const toggleEnableFunder = () => {
    const willEnable = !enableFunderAddress
    setEnableFunderAddress(willEnable)
    setFunder(willEnable ? walletAddress || '' : ProtocolFunder())
  }

  useEffect(() => {
    const uniquePools = filterDupPoolsByAntiquity(pools)
    setPoolTokenIds(uniquePools.map((p) => p.poolTokenId.toString()))
  }, [ltBalancesLoading])

  useEffect(() => {
    publishTokens(
      selectedTokenReward?.id,
      tokenRewardAmt,
      networkRewardAmt,
      funder,
    )
  }, [
    selectedTokenReward,
    tokenRewardAmt,
    networkRewardAmt,
    showNetworkReward,
    showTokenReward,
  ])

  const publishTokens = (
    rewardId: string,
    reward: string,
    netReward: string,
    networkRewardsFunder: string,
  ) =>
    onRewardsChange({
      rewardTokenId: rewardId,
      totalReward: reward || '0',
      networkRewards: netReward || undefined,
      networkRewardsFunder,
    })

  const tokens = useMemo(
    () => [
      ...sortByBigNumberBalance(
        tokenList.filter(
          ({ id, symbol }) => id !== '0' && symbol !== HUMBLE_LP_TOKEN_SYMBOL,
        ),
      ),
    ],
    [tokenList, poolTokenIds],
  )

  const selectedTokenRewardName = useMemo(
    () =>
      selectedTokenReward?.id
        ? `${selectedTokenReward.name} (${selectedTokenReward.id})`
        : '',
    [selectedTokenReward],
  )

  const network = getCurrentNetwork()
  const handleRewardCheck =
    (reward: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target
      if (reward === network) {
        onSelectReward(reward, checked)
        if (!checked) setNetworkRewardAmt('')
      }
      if (reward === 'other') {
        onSelectReward(reward, checked)
        if (!checked) {
          setSelectedTokenReward(undefined)
          setTokenRewardAmt('')
        }
      }
    }

  const handleFunderChange = (v?: string) => {
    const newFunder = v || walletAddress || ''
    setFunder(newFunder)
  }

  return (
    <fieldset>
      <LabelHeading>
        <Trans>2. Rewards</Trans>
      </LabelHeading>
      <p>
        <Trans>Choose the best combination.</Trans>
      </p>
      <RewardsSelector
        selectedTokenReward={selectedTokenReward}
        onRewardCheck={handleRewardCheck}
      />
      <Rewards>
        {showNetworkReward && (
          <Box>
            <ColumnLabel>
              <p>{PROMPTS.SET_REWARD_PAYOUT.replace('%%', network)}</p>
              <TokenInput
                aria-invalid={
                  isPublicFarm && Number(networkRewardAmt) > ownNetworkTokens
                }
                amount={networkRewardAmt}
                inputAmt={networkRewardAmt}
                onAmountInput={setNetworkRewardAmt}
                onScroll={(e) => e.currentTarget.blur()}
                placeholder='10000000'
                variant='reward'
              />
            </ColumnLabel>

            {!isPublicFarm && (
              <>
                <CheckboxContainer>
                  <Checkbox
                    onChange={toggleEnableFunder}
                    value={enableFunderAddress}
                  >
                    <>{PROMPTS.SET_ALT_REWARD_PAYER.replace('%%', network)}</>
                  </Checkbox>
                </CheckboxContainer>

                {enableFunderAddress && (
                  <ColumnLabel>
                    <p>
                      <Trans>
                        Which wallet address will fund the {network} reward?
                      </Trans>
                    </p>
                    <StyledInput
                      data-testid='net-rewards-funder-input'
                      onChange={({ target }) =>
                        handleFunderChange(target.value)
                      }
                      placeholder={walletAddress as string}
                      value={funder}
                    />
                  </ColumnLabel>
                )}
              </>
            )}
          </Box>
        )}
        {showTokenReward && (
          <Box>
            <Grid>
              <ColumnLabel>
                <p>
                  <Trans>
                    Which token will you reward stakers in? Select the token
                    below.
                  </Trans>
                </p>

                <TokenIdInput
                  aria-invalid={
                    !!stakeTokenId && stakeTokenId === selectedTokenReward?.id
                  }
                  data-test='reward-token-input'
                  onClick={() => setSelectToken(true)}
                  placeholder={USDC()}
                  value={selectedTokenRewardName}
                />
              </ColumnLabel>

              <ColumnLabel>
                <p>
                  <Trans>
                    How much {selectedTokenReward?.name || 'total rewards'} will
                    you issue in reward?
                  </Trans>
                </p>
                <TokenInput
                  amount={tokenRewardAmt}
                  dataTestId='total-rewards-input'
                  inputAmt={tokenRewardAmt}
                  isDisabled={!selectedTokenReward}
                  onAmountInput={setTokenRewardAmt}
                  onScroll={(e) => e.currentTarget.blur()}
                  placeholder='10000000'
                  variant='reward'
                />
              </ColumnLabel>
            </Grid>
          </Box>
        )}
        <TokenSelector
          isSelecting={selectToken}
          onTokenSelected={setSelectedTokenReward}
          selected={selectedTokenReward}
          setSelecting={() => setSelectToken(false)}
          tokenList={tokens}
        />
      </Rewards>
    </fieldset>
  )
}

export default CreateFarmRewards
