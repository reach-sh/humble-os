import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import styled from 'styled-components'
import { NullableDate } from 'types/shared'
import {
  calcNewerDate,
  dateRegEx,
  splitToConstituents,
  timeRegEx,
  dayPeriodRegEx,
} from 'utils/date'
import { GridContainer } from './FlexContainer'
import { StyledInput } from './Form'
import HSPickerContainer, {
  HSPickerHeader,
  HSPopperModifiers,
} from './HSDatePicker.Containers'

type DatePickerProps = {
  onChange(d: NullableDate[]): any
  value: NullableDate
  endDate: NullableDate
  startDate: NullableDate
  testId?: string
  placeholderText?: string
  minDate?: NullableDate
  maxDate?: NullableDate
  selectsRange?: boolean
  selectsStart?: boolean
  selectsEnd?: boolean
}
const formatDate = (d: NullableDate) =>
  d ? DateTime.fromJSDate(d).toFormat('yyyy-LL-dd') : 'invalid date'
const formatTime = (d: NullableDate) =>
  d ? DateTime.fromJSDate(d).toFormat('hh:mm a') : 'invalid date'
// Flip dates if user selected a valid endDate that precedes startDate
const sortAscending = (a: NullableDate, b: NullableDate) => {
  if (a === null && b) return -1
  if (b === null && a) return 1
  if (a !== null && b !== null) {
    const aTime = a.getTime()
    const bTime = b.getTime()
    if (aTime > bTime) return 1
    if (aTime < bTime) return -1
  }
  return 0
}

/** Custom date-picker component */
const HSDatePicker = (props: DatePickerProps) => {
  const {
    minDate,
    maxDate,
    onChange: publishDates,
    testId = 'datepicker',
    startDate = null,
    endDate = null,
    placeholderText,
    selectsEnd = false,
    selectsRange = false,
    selectsStart = false,
    value,
  } = props
  // compensate onChange and always send an array to parent
  // 'dates' is an array when 'selectRange' is true.
  const handleDates = (dates: NullableDate | NullableDate[]) => {
    const d = Array.isArray(dates) ? dates : [dates, null]
    const inRange = selectsRange || selectsStart
    const newEnd = inRange ? calcNewerDate(d[1] || d[0], endDate) : d[1] || null

    if (selectsEnd) return publishDates([startDate, d[0]].sort(sortAscending))
    return selectsStart || selectsRange
      ? publishDates([d[0], newEnd])
      : publishDates(d)
  }
  const [tDate, setTempDate] = useState(formatDate(value))
  const [tTime, setTempTime] = useState(formatTime(value))
  const validDate = useMemo(() => {
    const trimDate = tDate.trim()
    const dateDT = DateTime.fromFormat(trimDate, 'yyyy-MM-dd')
    const yearsDiff = dateDT.diffNow().shiftTo('year').years
    const absYearsDiff = yearsDiff - (yearsDiff % 1)
    return dateDT.isValid && absYearsDiff <= 5
  }, [tDate])
  const validTime = useMemo(() => {
    const [h, m, period] = splitToConstituents(tTime)
    const hasAMPM = dayPeriodRegEx.test(period)
    return h < 24 && h > 0 && m <= 59 && hasAMPM
  }, [tTime])

  const safeDate = (d: string) => {
    if (!dateRegEx.test(d.trim())) return 'invalid date'
    const next = DateTime.fromISO(d)
    return next.isValid ? next.toJSDate() : 'invalid date'
  }
  const onDateInput = (val: string) => {
    setTempDate(val)
    const safeInput = safeDate(val)
    if (safeInput === 'invalid date') return
    // prevent entry below minDate, and set time (hh:mm) to last selection
    const safeValue = value
      ? DateTime.fromJSDate(value)
      : { hour: 0, minute: 0 }
    const max = DateTime.max(
      DateTime.fromJSDate(minDate || new Date()),
      DateTime.fromJSDate(safeInput),
    )
      .set({ hour: safeValue.hour, minute: safeValue.minute })
      .toJSDate()
    handleDates(max)
  }
  const onTimeInput = (val: string) => {
    const inputTime = val.toUpperCase()
    setTempTime(inputTime)
    if (!timeRegEx.test(inputTime.trim())) return
    const [hour, mins, dayPeriod] = inputTime.replace(/(:|\s)/g, ',').split(',')
    const mins60 = Number(mins) % 60
    let hour24 = Number(hour) % 24
    if (hour24 === 12 && dayPeriod === 'AM') hour24 = 0
    else if (hour24 < 12 && dayPeriod === 'PM') hour24 += 12

    // @ts-expect-error
    const lxDate = DateTime.fromJSDate(value)
    if (!lxDate.isValid) return
    const safe = lxDate.set({ hour: hour24, minute: mins60 })
    handleDates(safe.toJSDate())
  }

  return (
    <HSPickerContainer data-test={testId}>
      <GridContainer columns='48% 48%'>
        <StyledInput
          data-testid='hsd-date-input'
          onChange={({ target }) => onDateInput(target.value)}
          placeholder='YYYY-MM-dd'
          type='text'
          aria-invalid={!validDate}
          value={tDate}
        />
        <StyledInput
          data-testid='hsd-time-input'
          onChange={({ target }) => onTimeInput(target.value)}
          placeholder='HH:MM (AM or PM)'
          type='text'
          aria-invalid={!validTime}
          value={tTime}
        />
      </GridContainer>

      <DatePicker
        data-test='datepicker-input'
        selected={value}
        endDate={endDate}
        minDate={minDate || new Date()}
        maxDate={maxDate}
        startDate={startDate}
        inline
        selectsEnd={selectsEnd}
        selectsRange={selectsRange}
        selectsStart={selectsStart}
        dateFormat='yyyy-MM-d (h:mm aa)'
        onChange={(d: any) => handleDates(d)}
        popperModifiers={HSPopperModifiers}
        popperPlacement='top'
        placeholderText={placeholderText || 'Select a date'}
        renderCustomHeader={HSPickerHeader}
      />
    </HSPickerContainer>
  )
}

export default styled(HSDatePicker)``
