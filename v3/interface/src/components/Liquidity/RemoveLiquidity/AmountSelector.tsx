import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import { commonInputStyles } from 'components/Common/Form'

const AmountSelectorContainer = styled.div`
  margin-bottom: 1rem;
`
const SliderTick = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.shadow};
  font-weight: bold;
`

const TickWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  top: -25px;
`

const PercentControls = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 7.25rem;
  @media (max-width: ${SIZE.lg}) {
    grid-template-columns: 1fr 1fr 1fr 1fr 5rem;
  }
`

const PercentButton = styled.button<{ active?: boolean }>`
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  padding: 5px 0;
  background: ${({ theme, active }) =>
    active ? theme.colors.altButtonActive : theme.colors.altButton};
  color: ${({ theme, active }) =>
    active ? theme.colors.altButtonActiveText : theme.colors.altButtonText};
  border: ${({ theme }) => theme.colors.altButtonBorder};
  &:hover {
    cursor: pointer;
  }
`

const CustomInput = styled.input`
  ${commonInputStyles}
  border-radius: 3px;
  color: ${({ theme }) => theme.colors.altButtonText};
  width: 100%;
  font-size: 12px;
  height: 100%;
  padding-left: 0.5rem;
`
const PercentSign = styled.span`
  position: absolute;
  top: 3px;
  right: 0.5rem;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.altButtonText};
`

const AmountSelectorSlider = styled.input`
  width: 100%;
  margin-bottom: 1rem;
  -webkit-appearance: none;
  background: transparent;
  &::-webkit-slider-runnable-track {
    height: 1px;
    background: ${({ theme }) => theme.colors.shadow};
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    z-index: 999;
    position: relative;
    margin-top: -7px;
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.text};
    cursor: grab;
  }
`

type AmountSelectorProps = {
  setWithdrawalPercentage: (percentage: string) => void
  withdrawPercentage: string
  withdrawing?: boolean
}

const AmountSelector = ({
  setWithdrawalPercentage,
  withdrawPercentage,
  withdrawing,
}: AmountSelectorProps) => {
  const percentages = ['25', '50', '75', '100']

  const updatePercentage = (percentage: string) => {
    if (withdrawing) return
    setWithdrawalPercentage(percentage)
  }

  const handleCustomChange = (e: any) => {
    if (withdrawing) return
    const { value } = e.target
    const fmtValue = Math.floor(Number(value))
    const fixedValue = Number.isNaN(fmtValue) ? 0 : fmtValue

    if (fixedValue > 100) {
      setWithdrawalPercentage('100')
    } else if (fixedValue < 0) {
      setWithdrawalPercentage('0')
    } else {
      setWithdrawalPercentage(fixedValue.toString())
    }
  }

  return (
    <>
      <AmountSelectorContainer data-testid='slider'>
        <AmountSelectorSlider
          type='range'
          min='0'
          max='100'
          list='ticks'
          onChange={handleCustomChange}
          value={withdrawPercentage}
        />
        <TickWrapper>
          <SliderTick style={{ left: '-2px' }}>|</SliderTick>
          <SliderTick>|</SliderTick>
          <SliderTick>|</SliderTick>
          <SliderTick>|</SliderTick>
          <SliderTick style={{ right: '-2px' }}>|</SliderTick>
        </TickWrapper>
        <PercentControls>
          {percentages.map((p, i) => (
            <PercentButton
              key={i}
              active={withdrawPercentage === p}
              onClick={() => updatePercentage(p)}
            >{`${p}%`}</PercentButton>
          ))}
          <div>
            <CustomInput
              data-testid='percentage-input'
              placeholder='Custom'
              max='100'
              type='text'
              onChange={handleCustomChange}
              value={withdrawPercentage}
            />
            <PercentSign>%</PercentSign>
          </div>
        </PercentControls>
      </AmountSelectorContainer>
    </>
  )
}

export default AmountSelector
