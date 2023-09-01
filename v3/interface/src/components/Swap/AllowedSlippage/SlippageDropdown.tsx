import ToleranceInput from 'components/Common/ToleranceInput'
import { useRef } from 'react'
import styled from 'styled-components'
import { colorAndOpacityToHex } from 'utils/styling'
import useSlippageTolerance from '../../../hooks/useSlippageTolerance'

const DropdownContainer = styled.div`
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.lighterBackground};
  width: 130px;
  min-height: 100px;
  position: absolute;
  padding: ${({ theme }) => theme.sizes.sm} 0px;
  top: 1.5rem;
  right: 0;
  z-index: 999;
  box-shadow: ${({ theme }) => `0px 4px 5px ${theme.colors.shadow}`};
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
`

const ListColumn = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: none;
`

const Tolerance = styled.li<{ active: boolean }>`
  text-align: right;
  width: 100%;
  transition: background 0.5s;
  background: ${({ active, theme }) =>
    active ? theme.colors.body : theme.colors.lighterBackground};
  padding: 2px 8px;

  :hover {
    background: ${({ active, theme }) =>
      !active
        ? colorAndOpacityToHex(theme.colors.body, 60)
        : theme.colors.body};
    cursor: pointer;
  }
`

const OuterInputContainer = styled.div<{ active: boolean }>`
  padding: 2px 8px;
  display: flex;
  justify-content: flex-end;
  transition: background 0.5s;
  background: ${({ active, theme }) =>
    active ? theme.colors.body : theme.colors.lighterBackground};
`

const InnerInputContainer = styled.div`
  flex: 0.8;
`

const ErrorMessage = styled.span`
  margin-top: ${({ theme }) => theme.sizes.xs};
  font-size: 12px;
  text-align: center;
  animation: shake 300ms ease-out;
  color: ${({ theme }) => theme.colors.error};
`

export default function SlippageDropdown() {
  const {
    custom,
    cacheTolerance,
    presets,
    isButtonActive,
    isError,
    isCustomActive,
    errorMessage,
    selectText,
    onBlur,
    setCustomTolerance,
  } = useSlippageTolerance()
  const dropdownRef = useRef<HTMLDivElement>(null)

  return (
    <DropdownContainer ref={dropdownRef}>
      <ListColumn>
        {presets.map((t, i) => (
          <Tolerance
            key={i}
            active={isButtonActive(t)}
            onClick={() => cacheTolerance(t)}
          >
            {t} %
          </Tolerance>
        ))}
        <OuterInputContainer active={isCustomActive}>
          <InnerInputContainer>
            <ToleranceInput
              border
              value={custom}
              error={isError}
              active={isCustomActive}
              onBlur={onBlur}
              onClick={({ target }) => selectText(target)}
              onChange={({ target }) => setCustomTolerance(target.value)}
            />
          </InnerInputContainer>
        </OuterInputContainer>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </ListColumn>
    </DropdownContainer>
  )
}
