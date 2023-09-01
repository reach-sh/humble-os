import { ChangeEvent } from 'react'
import styled from 'styled-components'
import { DateTime } from 'luxon'
import { COLORS } from 'theme'
import { useTheme } from 'contexts/theme'
import { blockInvalidChar } from 'utils/input'
import ChevronAltIcon from 'components/Common/Icons/chevron-alt'

const PeriodDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 18px 0;
  user-select: none;
`

const PeriodInputContainer = styled.div`
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.borderAlt};
  display: flex;
  justify-content: flex-end;
  padding: 0 6px;
  width: 100px;
  span {
    color: ${COLORS.midGray};
    font-size: 16px;
    font-weight: 600;
    margin-left: 6px;
  }
`

const PeriodInput = styled.input`
  background-color: transparent;
  color: currentColor;
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  width: 50%;
  &:focus {
    outline: none;
  }
`

const PeriodText = styled.div`
  align-items: center;
  display: flex;
  font-size: 10px;
  gap: 18px;
  justify-content: space-between;
  span {
    background-color: ${({ theme }) => theme.colors.card};
    border-radius: 5px;
    display: flex;
    justify-content: center;
    width: 80px;
  }
`

const PeriodRange = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  position: relative;
  user-select: none;
  input {
    -webkit-appearance: none;
    appearance: none;
    background-color: transparent;
    bottom: 1px;
    height: 20px;
    left: 0px;
    position: absolute;
    width: 100%;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-runnable-track {
      background: transparent;
      cursor: pointer;
      height: 10px;
      width: 100%;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: ${COLORS.yellow};
      border-radius: 12px;
      cursor: pointer;
      height: 20px;
      width: 20px;
    }
    &:focus::-webkit-slider-runnable-track {
      background: transparent;
    }
    &::-moz-range-track {
      background: transparent;
      cursor: pointer;
      height: 20px;
      width: 100%;
    }
    &::-moz-range-thumb {
      background: ${COLORS.yellow};
      border-radius: 12px;
      border: none;
      cursor: pointer;
      height: 20px;
      width: 20px;
    }
  }
`

const Ticks = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  width: calc(100% - 20px);
`

const TicksLine = styled.div`
  background-color: ${COLORS.lightGray};
  border-bottom: 1px solid ${COLORS.lightGray};
  border-top: 1px solid ${COLORS.lightGray};
  bottom: 5px;
  height: 0px;
  left: 0;
  position: absolute;
  width: calc(100% - 2px);
`

const TicksActiveLine = styled(TicksLine)<{ width: string }>`
  background-color: ${COLORS.yellow};
  border-bottom: 1px solid ${COLORS.yellow};
  border-top: 1px solid ${COLORS.yellow};
  max-width: calc(100% - 2px);
  width: ${({ width }) => width};
`

const Tick = styled.div`
  height: 12px;
  position: relative;
  width: 0px;
  &.visible {
    background-color: ${COLORS.lightGray};
    border: 1px solid ${COLORS.lightGray};
  }
  &.active {
    background-color: ${COLORS.yellow};
    border: 1px solid ${COLORS.yellow};
  }
`

const TickLabel = styled.div`
  display: flex;
  font-size: 10px;
  font-weight: 900;
  justify-content: center;
  left: -10px;
  position: absolute;
  top: -26px;
  width: 20px;
`

interface PeriodSelectorProps {
  farmEndDate: string
  onChange: (s: number) => void
  value: number
}
// TODO: Change to not say farms
const MAX_DAYS = 60
const TICKS_LABELS = [1, 15, 30, 45, 60]

const PeriodSelector = ({
  farmEndDate,
  onChange,
  value,
}: PeriodSelectorProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const displayEndDate = DateTime.now().plus({ days: value }).toLocaleString()
  const daysToEndFarm = parseInt(farmEndDate, 10)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: days } = e.target
    if (Number(days) > daysToEndFarm) {
      onChange(daysToEndFarm)
      return
    }
    if (Number(days) > MAX_DAYS) {
      onChange(MAX_DAYS)
      return
    }
    onChange(Number(days))
  }

  return (
    <>
      <PeriodDisplay>
        <PeriodInputContainer>
          <PeriodInput
            inputMode='numeric'
            onChange={handleChange}
            onKeyDown={(e) => blockInvalidChar(e, value)}
            type='text'
            value={value}
          />
          <span>days</span>
        </PeriodInputContainer>
        <PeriodText>
          Today
          <ChevronAltIcon dark={isDarkMode} />
          <span>{displayEndDate}</span>
        </PeriodText>
      </PeriodDisplay>
      <PeriodRange>
        <Ticks>
          {[...Array(MAX_DAYS)].map((_, i) => {
            const showTick = TICKS_LABELS.includes(i + 1)
            const isActive = daysToEndFarm >= i + 1
            return (
              <Tick
                key={`tick-${i}`}
                className={showTick ? (isActive ? 'active' : 'visible') : ''}
              >
                {showTick && <TickLabel>{`${i + 1}D`}</TickLabel>}
              </Tick>
            )
          })}
          <TicksLine />
          <TicksActiveLine
            width={`${(daysToEndFarm / (MAX_DAYS - 1)) * 100}%`}
          />
        </Ticks>
        <input
          max={MAX_DAYS.toString()}
          min='1'
          onChange={handleChange}
          type='range'
          value={value}
        />
      </PeriodRange>
    </>
  )
}

export default PeriodSelector
