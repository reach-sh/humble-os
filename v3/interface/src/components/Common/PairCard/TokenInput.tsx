import SIZE from 'constants/screenSizes'
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  UIEventHandler,
} from 'react'
import styled, { css } from 'styled-components'
import { COLORS } from 'theme'
import { blockInvalidChar } from 'utils/input'
import FlexContainer from '../FlexContainer'
import { Input, styledInputStyles } from '../Form'

const PairCardLayoutStyle = css`
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 7px;
  width: 100%;
`
const PairCardInputStyle = css`
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  width: 100%;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #9ca2aa;
  }
  @media (max-width: ${SIZE.sm}) {
    font-size: 21px;
  }
`
const PairCardInput = styled.input<{
  variant?: 'pairCard' | 'reward' | 'rate'
}>`
  ${PairCardLayoutStyle}
  ${PairCardInputStyle}
  padding: 4px;
`

const RewardInput = styled(Input)`
  ${styledInputStyles}
`
const RateLayout = styled(FlexContainer)`
  ${PairCardLayoutStyle}
  height: 34px;
  justify-content: space-between;
  align-items: center;
  padding: 0px 4px;
`
const TokenLabel = styled(FlexContainer)`
  color: ${({ theme }) => theme.colors.textAlt2};
  text-decoration: underline;
  height: 100%;
  padding: 0px 8px;
  font-size: 10px;
  font-weight: 500;
  line-height: 12px;
  border-right: 1px solid ${COLORS.lightGray};
  min-width: 25px;
  align-items: center;
  justify-content: center;
`
const RateInput = styled.input`
  ${PairCardInputStyle}
  background: ${({ theme }) => theme.colors.inputBackground};
`

const KeyedInputs = {
  pairCard: PairCardInput,
  reward: RewardInput,
  rate: RateLayout,
}

const TokenInput = forwardRef(
  (
    {
      tokenSymbol,
      amount,
      inputAmt,
      dataTestId,
      onAmountInput,
      isDisabled = false,
      onScroll,
      placeholder,
      variant,
      onBlur,
      onFocus,
    }: {
      tokenSymbol?: string
      amount?: string | number
      inputAmt?: string
      dataTestId?: string
      onAmountInput?: (value: string) => void
      isDisabled?: boolean
      onScroll?: UIEventHandler<HTMLInputElement>
      placeholder?: string
      variant?: 'pairCard' | 'reward' | 'rate'
      onBlur?: () => void
      onFocus?: () => void
    },
    ref,
  ) => {
    const [cursor, setCursor] = useState<number | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef?.current?.focus()
      },
    }))

    useEffect(() => {
      const input = inputRef?.current

      if (input && input === document.activeElement) {
        // input === document.activeElement check to avoid jumping to next input on mobile
        input.setSelectionRange(cursor, cursor)
      }
    }, [inputRef, cursor, inputAmt])

    const handleChange = (target: EventTarget & HTMLInputElement) => {
      const value = target.value.replaceAll(',', '.')
      if (value === '.' && !inputAmt) {
        // NOTE: If user first input is ".", add one step to text selector position
        setCursor((target.selectionStart || 0) + 1)
      } else {
        setCursor(target.selectionStart)
      }
      if (onAmountInput) onAmountInput(value)
    }

    if (variant === 'rate') {
      return (
        <RateLayout
          data-testid={dataTestId}
          ref={inputRef}
          placeholder={placeholder}
          onScroll={onScroll}
        >
          <TokenLabel>{tokenSymbol}</TokenLabel>
          <RateInput
            type='text'
            onChange={({ target }) => handleChange(target)}
            onBlur={onBlur}
            onFocus={onFocus}
            value={inputAmt}
            onKeyDown={(e) => blockInvalidChar(e, amount ?? '')}
            placeholder={placeholder}
            disabled={isDisabled}
            inputMode='decimal'
          />
        </RateLayout>
      )
    }
    const AmountInput = variant
      ? KeyedInputs[variant]
      : styled.input<{ variant?: 'pairCard' | 'reward' | 'rate' }>``
    return (
      <AmountInput
        type='text'
        data-testid={dataTestId}
        ref={inputRef}
        onChange={({ target }) => handleChange(target)}
        onBlur={onBlur}
        onFocus={onFocus}
        value={inputAmt}
        onKeyDown={(e) => blockInvalidChar(e, amount ?? '')}
        placeholder={placeholder}
        disabled={isDisabled}
        inputMode='decimal'
        onScroll={onScroll}
        variant={variant}
        style={
          variant === 'pairCard'
            ? {
                cursor: isDisabled ? 'not-allowed' : 'inherit',
                borderBottom: 'none',
              }
            : {}
        }
      />
    )
  },
)

export default TokenInput
