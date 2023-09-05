import { DateTime } from 'luxon'
import {
  calcNewerDate,
  dateRegEx,
  dayPeriodRegEx,
  fromNow,
  splitToConstituents,
  timeRegEx,
} from 'utils/date'

describe('Date Utils', () => {
  it('Splits a "HH:MM a" string into its constituent parts', () => {
    const invalid = splitToConstituents()
    const invalid2 = splitToConstituents('1:00 PM')
    const valid = splitToConstituents('01:00 AM')
    expect(invalid[0]).toStrictEqual(-1)
    expect(invalid[1]).toStrictEqual(-1)
    expect(invalid[2]).toStrictEqual('')

    expect(valid[0]).toStrictEqual(1)
    expect(valid[1]).toStrictEqual(0)
    expect(valid[2]).toStrictEqual('AM')

    expect(invalid2[0]).toStrictEqual(-1)
    expect(invalid2[1]).toStrictEqual(-1)
    expect(invalid2[2]).toStrictEqual('')
  })

  it('Matches a "HH:MM a" time string', () => {
    expect(timeRegEx.test('')).toBe(false)
    expect(timeRegEx.test('1')).toBe(false)
    expect(timeRegEx.test('1:00')).toBe(false)
    expect(timeRegEx.test('1:00 A')).toBe(false)
    expect(timeRegEx.test('1:00 AM')).toBe(false)
    expect(timeRegEx.test('23:00 PM')).toBe(true)
    expect(timeRegEx.test('01:00 AM')).toBe(true)
    expect(timeRegEx.test('01:00 PM')).toBe(true)
    expect(timeRegEx.test('11:00 PM')).toBe(true)
  })

  it('Matches a "YYYY-MM-DD" date string', () => {
    expect(dateRegEx.test('')).toBe(false)
    expect(dateRegEx.test('1')).toBe(false)
    expect(dateRegEx.test('1:00')).toBe(false)
    expect(dateRegEx.test('1:00 A')).toBe(false)
    expect(dateRegEx.test('1:00 AM')).toBe(false)
    expect(dateRegEx.test('01-01-2020')).toBe(false)
    expect(dateRegEx.test('XXXX-XX-XX')).toBe(false)
    expect(dateRegEx.test('2202-99-11')).toBe(true)
    expect(dateRegEx.test('2021-11-11')).toBe(true)
  })

  it('Matches a day period', () => {
    expect(dayPeriodRegEx.test('')).toBe(false)
    expect(dayPeriodRegEx.test('PP')).toBe(false)
    expect(dayPeriodRegEx.test('AA')).toBe(false)
    expect(dayPeriodRegEx.test('A')).toBe(false)
    expect(dayPeriodRegEx.test('AM')).toBe(true)
    expect(dayPeriodRegEx.test('PM')).toBe(true)
  })

  it('Compares two dates and returns the newer one', () => {
    const nowDT = DateTime.now()
    const now = nowDT.toJSDate()
    const nowMS = now.getTime()
    const lastWeek = nowDT.set({ day: nowDT.day - 7 }).toJSDate()
    const lastWeekMS = lastWeek.getTime()
    const nullDate = null
    const nowOrNull = calcNewerDate(now, nullDate)
    const nowOrLastWeek = calcNewerDate(now, lastWeek)
    const nullOrLastWeek = calcNewerDate(nullDate, lastWeek)

    expect(nowOrLastWeek?.getTime()).toBe(nowMS)
    expect(nowOrNull?.getTime()).toBe(nowMS)
    expect(nullOrLastWeek?.getTime()).toBe(lastWeekMS)
  })

  it('Describes the difference between two dates as a "from-now" value', () => {
    const past = '2020-01-01'
    const future = '2172-01-01' // update test in ~150 years
    const diff = fromNow(past, 'days')
    expect(diff).toContain('ago')
    expect(future).not.toContain('ago')
  })
})
