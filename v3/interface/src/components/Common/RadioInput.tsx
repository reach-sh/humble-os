import { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import SIZE from 'constants/screenSizes'

const RadioLabel = styled.label<{ disabled?: boolean }>`
  display: block;
  position: relative;
  padding-left: 25px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  font-size: 1rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  color: ${({ theme }) => theme.colors.text};

  &:hover .checkmark:not(.checked)::after {
    content: '';
    display: block;
    opacity: 0.5;
  }
`
const Input = styled.input`
  cursor: pointer;
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;
`
const Indicator = styled.span`
  border-radius: 100%;
  border: 1px solid ${COLORS.darkSage};
  height: 16px;
  left: 0;
  position: absolute;
  top: 5px;
  width: 16px;

  &::after {
    background-color: ${COLORS.darkSage};
    border-radius: 100%;
    display: none;
    height: 60%;
    left: 20%;
    place-content: center;
    position: absolute;
    top: calc(20%);
    width: 60%;
  }

  &.checked::after {
    content: '';
    display: block;
  }

  @media (max-width: ${SIZE.sm}) {
    top: 2px;
  }
`

const RadioInput = ({
  children,
  name,
  disabled,
  onChange,
  checked = false,
  value,
}: {
  children: JSX.Element
  name: string
  disabled?: boolean
  onChange: (e: boolean) => void
  checked?: boolean
  value: any
}) => {
  const input = useRef<HTMLInputElement>(null)
  const state = useMemo(() => (checked ? 'checked' : ''), [checked])
  const className = useMemo(() => `checkmark ${state}`.trim(), [checked])

  return (
    <RadioLabel data-testid={`radio-${value}`} disabled={disabled}>
      {children}
      <Input
        ref={input}
        type='radio'
        disabled={disabled}
        name={name}
        onChange={() => onChange(value)}
        checked={checked}
      />
      <Indicator data-testid='indicator' className={className} />
    </RadioLabel>
  )
}

export default RadioInput
