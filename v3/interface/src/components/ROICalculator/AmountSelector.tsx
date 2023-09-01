import { Fragment } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import Tooltip from 'components/Common/Tooltip'
import QuestionIcon from 'assets/Icons/question-alt.svg'

const AmountSelectorContainer = styled.div`
  align-items: center;
  border-radius: 16px;
  display: flex;
  gap: 8px;
  height: 34px;
  justify-content: space-between;
  margin-top: 10px;
  user-select: none;
  > :not(:last-child) {
    flex-grow: 1;
  }
`

const AmountSelectorItem = styled.label`
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderAlt};
  cursor: pointer;
  display: flex;
  font-size: 12px;
  font-weight: 400;
  height: 26px;
  justify-content: center;
`

const AmountSelectorInput = styled.input.attrs({
  type: 'radio',
  name: 'amountselector',
})`
  display: none;
  &:checked + label {
    background-color: ${({ theme }) => theme.colors.selectorBg};
    color: ${({ theme }) => theme.colors.selectorTextColor};
  }
  &:disabled + label {
    background-color: #dce0e6;
    color: #9ca1aa;
    cursor: default;
  }
`

interface AmountSelectorProps {
  balance: number
  onSelect: (s: number) => void
  selected: number
  showFarmTooltip?: boolean
}

const AMOUNT_SELECTOR_OPTIONS = [
  { label: '100', value: 100 },
  { label: '1000', value: 1000 },
]

const AmountSelector = ({
  balance,
  onSelect,
  selected,
  showFarmTooltip = false,
}: AmountSelectorProps) => {
  const options = [
    ...AMOUNT_SELECTOR_OPTIONS,
    { label: 'My Balance', value: balance },
  ]
  const tooltip = showFarmTooltip
    ? t`“My Balance” here includes both LP Tokens in your wallet, and LP Tokens already staked in this farm.`
    : t`“My Balance” uses your available balance of LP Tokens for this pool.`

  return (
    <AmountSelectorContainer>
      {options.map(({ label, value }) => (
        <Fragment key={label}>
          <AmountSelectorInput
            checked={selected === value}
            disabled={value === balance && balance === 0}
            id={label}
            onChange={() => onSelect(value)}
            value={label}
          />
          <AmountSelectorItem htmlFor={label}>{label}</AmountSelectorItem>
        </Fragment>
      ))}
      <Tooltip message={tooltip} position='topLeft'>
        <img src={QuestionIcon} alt='help icon' />
      </Tooltip>
    </AmountSelectorContainer>
  )
}

export default AmountSelector
