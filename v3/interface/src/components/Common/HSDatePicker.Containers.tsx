import { t } from '@lingui/macro'
import { DateTime } from 'luxon'
import styled from 'styled-components'
import { COLORS } from 'theme'
import FlexContainer from './FlexContainer'
import { styledInputStyles } from './Form'
import { ListViewSelect } from './ListViewSelect'

const offsetMod = {
  name: 'offset',
  options: { offset: [0, 20] },
}
const preventOverflowMod = {
  name: 'preventOverflow',
  options: { rootBoundary: 'viewport', tether: false, altAxis: true },
}
export const HSPopperModifiers = [offsetMod, preventOverflowMod]

const year = new Date().getFullYear()
const years = [year, year + 1, year + 2, year + 3, year + 4]
const months = [
  t`January`,
  t`February`,
  t`March`,
  t`April`,
  t`May`,
  t`June`,
  t`July`,
  t`August`,
  t`September`,
  t`October`,
  t`November`,
  t`December`,
]
const HeaderContainer = styled(FlexContainer)`
  place-content: center;
  margin: 10px;
`

type PickerHeaderProps = {
  date: Date
  changeYear(newYear: number): any
  changeMonth(newMonth: number): any
}
export const HSPickerHeader = (props: PickerHeaderProps) => {
  const { date, changeYear, changeMonth } = props
  const { year: selectedYear } = DateTime.fromJSDate(date)
  const { month, year: currentYear } = DateTime.now()
  let offset = 0
  if (currentYear === selectedYear) offset = month - 1
  if (currentYear > selectedYear) offset = months.length
  const fMonths = months.slice(offset)

  return (
    <HeaderContainer>
      <ListViewSelect
        border
        value={months[date.getMonth()]}
        data={fMonths}
        itemText={(m: string) => m}
        onItemClick={(m: string) => changeMonth(months.indexOf(m))}
        testId='month-selector'
      />

      <ListViewSelect
        value={date.getFullYear()}
        data={years}
        itemText={(m: number) => m}
        onItemClick={(yr) => changeYear(yr)}
        testId='year-selector'
      />
    </HeaderContainer>
  )
}

// This prevents the linter from formatting the classes into a single line,
// AND THEN complaining about the length of the line
const dayClasses = `.react-datepicker__day--selected, 
.react-datepicker__day--range-end, 
.react-datepicker__day--range-start`

/** Style overrides for HS DatePicker component containers */
export const HSPickerContainer = styled.aside`
  position: relative;
  min-height: 320px;

  .react-datepicker__day {
    cursor: pointer;
    z-index: 1;

    &:not([aria-disabled='true']):hover {
      font-weight: bold;
    }

    &[aria-disabled='true'] {
      cursor: not-allowed;
      color: ${COLORS.midGray};
    }

    &.react-datepicker__day--outside-month,
    &[aria-disabled='true'] {
      opacity: 0.8;
    }
  }

  .react-datepicker__day--in-range:not(${dayClasses}),
  .react-datepicker__day--range-end::before,
  .react-datepicker__day--range-start::before {
    background-color: ${COLORS.darkCream};
    color: ${COLORS.DMMidGray};
  }

  .react-datepicker__day--outside-month {
    color: ${COLORS.midGray};
  }

  .react-datepicker__day--range-end,
  .react-datepicker__day--range-start,
  .react-datepicker__day--selected {
    font-weight: bold;
    color: ${COLORS.black};

    &::after {
      border-radius: 100%;
      background-color: ${COLORS.sage};
      color: ${COLORS.black};
      content: '';
      display: block;
      height: 2.2rem;
      position: absolute;
      width: 2.2rem;
      z-index: -1;
    }
  }

  .react-datepicker__day--selected::after {
    background-color: ${COLORS.yellow};
  }

  .react-datepicker-popper {
    background-color: ${({ theme }) =>
      theme.colors.popoverBg === COLORS.darkCream
        ? 'white'
        : theme.colors.popoverBg};
    border-radius: ${({ theme }) => theme.sizes.borderRadius};
    margin: 0 auto;
    max-width: 300px;
    padding: ${({ theme }) => theme.sizes.md};
    width: 100%;
  }

  .react-datepicker-time__input input {
    ${styledInputStyles}
  }
`
export default HSPickerContainer
