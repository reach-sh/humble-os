import { ComponentPropsWithRef, useMemo, useState } from 'react'
import styled from 'styled-components'
import { getBlockchain, noOp } from '@reach-sh/humble-sdk'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalDex from 'hooks/useGlobalDex'
import deleteIcon from 'assets/Icons/delete.svg'
import { Form, Input, Label } from 'components/Common/Form'
import { GridContainer } from 'components/Common/FlexContainer'
import { WideButton } from 'components/Common/Button'
import CryptoIconPair from 'components/Common/CryptoIconPair'
import TokenSelector from 'components/Common/PairCard/TokenSelector'
import RotateIconButton from 'components/Common/RotateIconButton'
import { COLORS } from 'theme'
import { Token } from 'types/shared'
import { getTokenById } from 'helpers/pool'
import { ALGO_GOV_ENROLL_LIVE } from 'components/GovernanceNotification'
import ErrorContainer from 'components/Common/ErrorContainer'
import { XGOV_ESCROW, AlgoCommitmentOpts } from './ExpertGovs.Utils'

const FormContainer = styled(Form).attrs({ className: 'slide-down-fade-in' })`
  animation-delay: 150ms;
  animation-duration: 250ms;
  animation-fill-mode: backwards;
  margin: 2rem auto 0;
`
const CommitLPButton = styled(WideButton).attrs({ variant: 'accent' })`
  height: 48px;
  margin-top: 1rem;
`
const FormInput = styled(Input)`
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`
const BoldLabel = styled(Label)`
  font-weight: bold;
`
const Hint = styled.p`
  color: ${COLORS.midGray};
  font-size: smaller;
`
const HeroDescription = styled.p`
  margin-bottom: 2.2rem;
`
const LPCommitItem = styled(GridContainer)`
  margin-bottom: 0.5rem;
`
const SubmitButton = styled(WideButton)`
  font-weight: bold;
  margin-top: 1rem;
`
type FormProps = Omit<
  ComponentPropsWithRef<'form'>,
  'onSubmit' | 'onChange'
> & {
  data?: AlgoCommitmentOpts
  onSubmit(data: AlgoCommitmentOpts): any
  onChange?(data: AlgoCommitmentOpts): any
}

const EMPTY: AlgoCommitmentOpts = {
  commitAlgo: 0,
  gov: '',
  commitLP: [],
  govController: '',
}

export const ExpertGovsForm = (props: FormProps) => {
  const { onSubmit, onChange = noOp, data = EMPTY } = props
  const { walletAddress } = useGlobalUser(['walletAddress'])
  const { tokenList, pools } = useGlobalDex()
  const [addingLP, setAddingLP] = useState(false)
  const selectedLPs = useMemo(
    () => new Set(data.commitLP?.map(([id]) => id)),
    [data],
  )
  const [poolTokensMap, lpTokens] = useMemo(() => {
    const map = new Map<string, [Token | undefined, Token | undefined]>()
    const poolTokenIds: string[] = []
    pools.forEach(({ poolTokenId, tokAId, tokBId }) => {
      map.set(poolTokenId, [getTokenById(tokAId), getTokenById(tokBId)])
      poolTokenIds.push(poolTokenId)
    })
    const lp = tokenList.filter(
      ({ id, balance }) =>
        balance && poolTokenIds.includes(id) && !selectedLPs.has(id),
    )
    return [map, lp]
  }, [tokenList, pools, selectedLPs, data])
  const formData = useMemo(() => {
    if (!walletAddress) return undefined
    return { ...data, gov: walletAddress }
  }, [walletAddress, data, selectedLPs])
  const formDisabled = useMemo(
    () => !ALGO_GOV_ENROLL_LIVE || !walletAddress || data.commitAlgo === 0,
    [data, walletAddress],
  )
  const submitButtonText = useMemo(() => {
    if (!ALGO_GOV_ENROLL_LIVE) return 'Enrollment closed'
    return formDisabled ? 'Specify ALGO commitment' : 'Commit to xGov'
  }, [])

  const submit = () => formData && onSubmit(formData)
  const addLPCommitment = (token: Token) => {
    if (selectedLPs.has(token.id)) return

    const nextCommits = [...(data.commitLP || [])]
    nextCommits.push([token.id, 0])
    onChange({ ...data, commitLP: nextCommits })
  }
  const removeLPCommitment = (i: number) => {
    const nextCommits = data.commitLP?.filter((c, x) => x !== i)
    onChange({ ...data, commitLP: nextCommits })
  }
  const setAlgoCommit = (commitment: string) => {
    onChange({ ...data, commitAlgo: Number(commitment) })
  }
  const updateLPCommitment = (commit: string, i: number) => {
    const next = [...(data.commitLP || [])]
    next[i][1] = Number(commit)
    onChange({ ...data, commitLP: next })
  }
  const renderLPTokenItem = (d: string) => {
    const tokens = poolTokensMap.get(d)
    if (!tokens) return <></>

    const [A, B] = tokens
    return (
      <CryptoIconPair
        showText={window.innerWidth >= 300}
        firstTokId={A?.id}
        firstTokSymbol={A?.symbol}
        secondTokId={B?.id}
        secondTokSymbol={B?.symbol}
      />
    )
  }

  return (
    <FormContainer onSubmit={(e) => e.preventDefault()}>
      <p className='h5'>xGov Signup Form</p>
      <HeroDescription>
        Sign up to become an <b>Expert Governor</b> below.
      </HeroDescription>
      <hr className='divider' />

      <BoldLabel htmlFor='delegate'>Rewards Delegate Address</BoldLabel>
      <Hint>Address where you will commit governance rewards for a year</Hint>
      <FormInput name='delegate' value={XGOV_ESCROW} readOnly aria-disabled />

      <BoldLabel htmlFor='commitment'>{getBlockchain()} commitment</BoldLabel>
      <Hint>
        Enter a non-atomic value (e.g. 5 = <b>5 ALGO</b>)
      </Hint>
      <FormInput
        name='commitment'
        type='number'
        placeholder='e.g. 100'
        value={data.commitAlgo || ''}
        onChange={(e) => setAlgoCommit(e.target.value)}
      />

      <hr className='divider' />

      <BoldLabel>(OPTIONAL) LP Token commitments</BoldLabel>
      <Hint>Commit select LP Tokens for additional APR</Hint>
      {/* Commitments */}
      {data.commitLP?.map(([tokenId, commitment], i) => (
        <LPCommitItem columns='70% auto 42px' key={tokenId}>
          {renderLPTokenItem(tokenId)}

          <FormInput
            type='number'
            placeholder='e.g. 100'
            value={commitment}
            onChange={(e) => updateLPCommitment(e.target.value, i)}
          />

          <RotateIconButton
            customIcon={deleteIcon}
            onClick={() => removeLPCommitment(i)}
          />
        </LPCommitItem>
      ))}

      {lpTokens.length > 0 && (
        <CommitLPButton
          className='slide-down-fade-in'
          type='button'
          variant='accent'
          size='tiny'
          outline
          onClick={() => setAddingLP(true)}
        >
          Select LP Tokens
        </CommitLPButton>
      )}

      {ALGO_GOV_ENROLL_LIVE ? (
        <SubmitButton onClick={submit} disabled={formDisabled} type='button'>
          {submitButtonText}
        </SubmitButton>
      ) : (
        <ErrorContainer text='Governance Enrollment is currently closed' />
      )}

      <TokenSelector
        isSelecting={addingLP}
        tokenList={lpTokens}
        setSelecting={() => setAddingLP(false)}
        onTokenSelected={addLPCommitment}
      />
    </FormContainer>
  )
}

export default ExpertGovsForm
