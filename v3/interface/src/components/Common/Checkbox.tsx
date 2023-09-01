import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import SIZE from 'constants/screenSizes'

const CheckboxLabel = styled.label<{ disabled?: boolean }>`
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: grid;
  grid-template-areas: 'checkmark text';
  grid-template-columns: 20px auto;
  gap: 0 0.4rem;
  font-size: 1rem;
  user-select: none;

  & > .checkmark:after {
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`
const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;

  &:checked ~ .checkmark {
    background-color: ${COLORS.darkSage};

    &:after {
      display: block;
    }
  }
`
const Checkmark = styled.span`
  border-color: ${COLORS.darkSage};
  border-radius: 4px;
  border: 1px solid;
  grid-area: checkmark;
  height: 16px;
  left: 0;
  width: 16px;

  &:after {
    content: '';
    position: absolute;
    display: none;
  }

  @media (max-width: ${SIZE.sm}) {
    top: 2px;
  }
`
const TextContent = styled.span`
  grid-area: text;
`

const Checkbox = ({
  children,
  disabled,
  onChange,
  value = false,
}: {
  children: JSX.Element
  disabled?: boolean
  value?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const input = useRef<HTMLInputElement>(null)
  const checked = input.current?.checked || value ? 'checked' : ''
  const checkClass = `checkmark ${checked}`.trim()

  useEffect(() => {
    if (!input.current || value === undefined) return
    if (value !== input.current.checked) input.current.checked = value
  }, [value])

  return (
    <CheckboxLabel data-testid='checkbox' disabled={disabled}>
      <TextContent>{children}</TextContent>
      <CheckboxInput
        ref={input}
        type='checkbox'
        onChange={onChange}
        disabled={disabled}
      />
      <Checkmark data-testid='checkmark' className={checkClass} />
    </CheckboxLabel>
  )
}

export default Checkbox
