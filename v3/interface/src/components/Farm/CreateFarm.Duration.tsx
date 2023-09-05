import { t, Trans } from '@lingui/macro'
import styled from 'styled-components'
import {
  Break,
  ColumnLabel,
  LabelHeading,
  StyledInput,
  styledInputStyles,
} from 'components/Common/Form'
import HSDatePicker from 'components/Common/HSDatePicker'
import ModalComponent from 'components/Modals/ModalComponent'
import { useEffect, useMemo, useState } from 'react'
import time from 'assets/time.svg'
import { NullableDate } from 'types/shared'
import { DateTime } from 'luxon'
import { FarmDurationData } from './CreateFarmForm.Validate'

type CreateFarmDurationProps = {
  onDurationChange: (length: FarmDurationData) => Promise<void>
}

const Container = styled.fieldset``
const PickerInput = styled(StyledInput)`
  ${styledInputStyles}
  background-image: url(${time});
  background-position: 9px center;
  background-repeat: no-repeat;
  padding-left: calc(36px);
`
enum SELECTION {
  NONE = '0',
  START = 'start',
  END = 'end',
}
type FarmDurationRange = { starts: NullableDate; ends: NullableDate }

const CreateFarmDurations = (props: CreateFarmDurationProps) => {
  const nextFriday = DateTime.fromJSDate(new Date())
    .plus({ week: 1 })
    .endOf('week')
    .minus({ day: 2 })
    .toJSDate()

  const followingWeek = DateTime.fromJSDate(nextFriday)
    .plus({ week: 1 })
    .toJSDate()
  const { onDurationChange } = props
  const openDatePicker = (s: SELECTION) => selectDate(s)

  const [range, setRange] = useState<FarmDurationRange>({
    starts: nextFriday,
    ends: followingWeek,
  })

  const [selectingDate, selectDate] = useState(SELECTION.NONE)
  const safeUTC = (d?: Date | null) => d?.toUTCString() || ''
  const [selectedDates, setTempSelectedDate] = useState<NullableDate[]>([
    nextFriday,
    followingWeek,
  ])
  const selectedDate = useMemo(() => {
    if (selectingDate === SELECTION.START)
      return selectedDates[0] || range.starts
    if (selectingDate === SELECTION.END) return selectedDates[1] || range.ends
    return null
  }, [range.starts, range.ends, selectingDate, selectedDates])

  const dateFormat = 'yyyy-LLL-dd (hh:mm:00 a)'

  const ends = useMemo(() => {
    if (range.ends === null) return ''
    const d = DateTime.fromJSDate(range.ends || '')
    return d.isValid ? d.toFormat(dateFormat) : ''
  }, [range.ends])

  const starts = useMemo(() => {
    if (range.starts === null) return ''
    const d = DateTime.fromJSDate(range.starts || '')
    return d.isValid ? d.toFormat(dateFormat) : ''
  }, [range.starts])
  const closeDatePicker = () => selectDate(SELECTION.NONE)

  const applyDates = () => {
    const [start = range.starts, end = range.ends] = selectedDates
    closeDatePicker()
    setRange({ starts: start, ends: end })
    publishChanges(start, end)
  }
  // Notify parent
  const publishChanges = (startDate?: Date | null, endDate?: Date | null) => {
    const startDateTime = safeUTC(startDate)
    const endDateTime = safeUTC(endDate)
    onDurationChange({ startDateTime, endDateTime })
  }
  const handleDates = (dates: (Date | null)[]) => {
    if (selectingDate === SELECTION.NONE) return

    setTempSelectedDate(dates)
  }

  useEffect(() => {
    publishChanges(range.starts, range.ends)
  }, [])

  return (
    <Container>
      <LabelHeading>
        <Trans>3. Farm Start Day and Time</Trans>
      </LabelHeading>

      <ColumnLabel>
        <p>
          <Trans>
            When do you want the farm to be listed and start issuing rewards?
          </Trans>
        </p>

        <PickerInput
          data-testid='start-date-trigger-input'
          onClick={() => openDatePicker(SELECTION.START)}
          value={starts}
          readOnly
        />
      </ColumnLabel>

      <LabelHeading>
        <Trans>4. Farm Close Day and Time</Trans>
      </LabelHeading>

      <ColumnLabel>
        <p>
          <Trans>
            When do you want the farm to close and stop issuing rewards?
          </Trans>
        </p>

        <PickerInput
          data-testid='end-date-trigger-input'
          onClick={() => openDatePicker(SELECTION.END)}
          value={ends}
          placeholder={t`Select an end date`}
          readOnly
        />
      </ColumnLabel>

      <Break />

      <ModalComponent
        open={selectingDate !== '0'}
        onClose={closeDatePicker}
        onConfirm={applyDates}
      >
        <HSDatePicker
          key={selectedDate?.getTime() || 0}
          testId='modal-picker'
          selectsStart={selectingDate === SELECTION.START}
          selectsEnd={selectingDate === SELECTION.END}
          endDate={selectedDates[1] || range.ends}
          minDate={nextFriday}
          onChange={(dates) => handleDates(dates)}
          placeholderText={t`Select start date`}
          startDate={selectedDates[0] || range.starts}
          value={selectedDate}
        />
      </ModalComponent>
    </Container>
  )
}

export default CreateFarmDurations
