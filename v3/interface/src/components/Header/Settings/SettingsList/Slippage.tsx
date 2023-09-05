import Button from 'components/Common/Button'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import styled from 'styled-components'
import ToleranceInput from 'components/Common/ToleranceInput'
import useSlippageTolerance from 'hooks/useSlippageTolerance'

const Wrapper = styled(FlexColumnContainer)`
  margin: 0.5rem 0;
  padding: ${({ theme }) => theme.sizes.sm} 0;
`
const ToleranceControls = styled.div`
  margin-top: ${({ theme }) => theme.sizes.sm};
  display: grid;
  grid-template-columns: auto auto auto auto;
  grid-gap: 5px;
  margin-top: 1.5rem;
  ${Button} {
    font-size: 0.8rem;
  }

  ${Button} {
    font-weight: bolder;
    margin: 0 0.2rem 0 0;
    min-width: 3.8rem;
  }
`
const SlippageTitle = styled.p`
  margin-bottom: 0.25rem;
`
const SlippageInfo = styled.p`
  font-size: 12px;
`

interface ButtonProps {
  active?: boolean
}
const SlippageButton = styled.button<ButtonProps>`
  min-width: 4rem;
  border: none;
  border-radius: 4px;
  max-height: 2.25rem;
  background: ${({ theme, active }) =>
    active ? theme.colors.altButtonActive : theme.colors.altButton};
  color: ${({ theme, active }) =>
    active ? theme.colors.altButtonActiveText : theme.colors.altButtonText};
  &:hover {
    cursor: pointer;
  }
`

const ErrorMessage = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.sizes.xs};
  text-align: right;
`

/**
 * Slippage settings components
 */

const Slippage = () => {
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

  return (
    <Wrapper>
      <SlippageTitle>Slippage Tolerance</SlippageTitle>
      <SlippageInfo>
        Your transaction will revert if the price changes unfavorably more than
        this percentage.
      </SlippageInfo>
      <ToleranceControls>
        {presets.map((t, i) => (
          <SlippageButton
            active={isButtonActive(t)}
            key={i}
            onClick={() => cacheTolerance(t)}
          >
            {`${t}%`}
          </SlippageButton>
        ))}
        <ToleranceInput
          value={custom}
          error={isError}
          active={isCustomActive}
          onBlur={onBlur}
          onClick={({ target }) => selectText(target)}
          onChange={({ target }) => setCustomTolerance(target.value)}
        />
      </ToleranceControls>
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </Wrapper>
  )
}

export default Slippage
