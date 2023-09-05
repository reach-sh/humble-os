import React, { useState } from 'react'
import styled from 'styled-components'
import { inputBgColor, inputBorderColor } from 'utils/styling'
import FlexContainer from './FlexContainer'

const Input = styled.input`
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  padding: 0;
  text-align: right;
  font-size: 0.8rem;
  width: 100%;
  height: 30px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
  }
`
const InputLabel = styled.div<{
  active?: boolean
  error: boolean
  border?: boolean
}>`
  display: flex;
  border: 1px solid ${inputBorderColor};
  background-color: ${inputBgColor};
  outline: none;
  border-radius: 4px;
  font-weight: bolder;
  max-height: 2.25rem;
  place-content: center;
  width: 100%;
`
const InputPct = styled(FlexContainer).attrs({ inline: true })`
  font-size: 0.6rem;
  padding: 0 0.2rem;
  background: transparent;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  max-height: 2.25rem;
`

type Props = {
  error: boolean
  active: boolean
  value: string
  border?: boolean
  onBlur: React.FocusEventHandler<HTMLInputElement>
  onClick: React.MouseEventHandler<HTMLInputElement>
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export default function ToleranceInput({
  error,
  active,
  value,
  onClick,
  onChange,
  onBlur,
  border,
}: Props) {
  const [focused, setFocused] = useState(active)
  return (
    <InputLabel border={border} error={error} active={focused}>
      <Input
        type='number'
        placeholder='Custom'
        onBlur={(e) => {
          onBlur(e)
          setFocused(false)
        }}
        onFocus={() => setFocused(true)}
        onClick={onClick}
        onChange={onChange}
        max={99}
        maxLength={2}
        step={0.25}
        min={0.1}
        value={value}
      />
      <InputPct>%</InputPct>
    </InputLabel>
  )
}
