import { DateTime, DurationUnit } from 'luxon'
import { NullableDate } from 'types/shared'

// Match a string to pattern 'HH:MM AM' or 'HH:MM PM'
export const timeRegEx = /[0-9]{2}:[0-9]{2}\s(PM|AM)/
// Match a string to pattern 'YYYY-MM-DD'
export const dateRegEx = /[0-9]{4}-[0-9]{2}-[0-9]{2}/
// Match a string to pattern 'AM' or 'PM'
export const dayPeriodRegEx = /(AM|PM)/

/**
 * Remove the colon and space from a 'HH:MM a' string and
 * split it into three constituent parts parts
 */
export function splitToConstituents(timeString = ''): [number, number, string] {
  if (timeRegEx.test(timeString)) {
    const [h, m, ampm] = timeString.replace(/(:|\s)/g, ',').split(',')

    // Return [ hour, minute, dayperiod (AM | PM) ]
    return [Number(h), Number(m), ampm.trim()]
  }

  return [-1, -1, '']
}
/** Compare two `Nullable` date values and return the newer date */
export function calcNewerDate(d: NullableDate, old: NullableDate) {
  if (old !== null && d !== null) {
    const lxNew = DateTime.fromJSDate(d)
    return DateTime.fromJSDate(old).diff(lxNew).valueOf() < 0 ? d : old
  }

  return d || old
}

export function fromNow(d: string, unit: DurationUnit = 'days') {
  const n = DateTime.fromJSDate(new Date(d)).diffNow(unit).as(unit)
  const hoursFraction = Math.abs(n) % 1
  const hours = Math.round(hoursFraction * 24)
  const days = Math.abs(n) - hoursFraction
  let fmt = `${days} days`
  if (hours > 0) fmt = `${fmt} ${hours} hours`

  return n < 0 ? `${fmt} ago` : fmt
}
