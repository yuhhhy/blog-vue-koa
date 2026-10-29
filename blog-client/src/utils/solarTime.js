const DAY_MS = 86400000
const RAD = Math.PI / 180
const J1970 = 2440588
const J2000 = 2451545
const OBLIQUITY = RAD * 23.4397

const toJulian = date => date.valueOf() / DAY_MS - 0.5 + J1970
const fromJulian = julian => new Date((julian + 0.5 - J1970) * DAY_MS)
const toDays = date => toJulian(date) - J2000
const solarMeanAnomaly = days => RAD * (357.5291 + 0.98560028 * days)
const eclipticLongitude = anomaly => {
  const equationOfCenter = RAD * (
    1.9148 * Math.sin(anomaly)
    + 0.02 * Math.sin(2 * anomaly)
    + 0.0003 * Math.sin(3 * anomaly)
  )
  return anomaly + equationOfCenter + RAD * 102.9372 + Math.PI
}
const declination = longitude => Math.asin(Math.sin(longitude) * Math.sin(OBLIQUITY))
const julianCycle = (days, westLongitude) => Math.round(days - 0.0009 - westLongitude / (2 * Math.PI))
const approxTransit = (hourAngle, westLongitude, cycle) => (
  0.0009 + (hourAngle + westLongitude) / (2 * Math.PI) + cycle
)
const solarTransitJulian = (transit, anomaly, longitude) => (
  J2000 + transit + 0.0053 * Math.sin(anomaly) - 0.0069 * Math.sin(2 * longitude)
)
const hourAngle = (altitude, latitude, solarDeclination) => Math.acos(
  (Math.sin(altitude) - Math.sin(latitude) * Math.sin(solarDeclination))
  / (Math.cos(latitude) * Math.cos(solarDeclination))
)

const getDateParts = (value, timezone) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(value).map(part => [part.type, part.value]),
  )
  return [Number(parts.year), Number(parts.month), Number(parts.day)]
}

const getSolarEvent = (cycle, westLongitude, anomaly, longitude, latitude, solarDeclination, altitude, isSet) => {
  const angle = hourAngle(altitude, latitude, solarDeclination)
  if (!Number.isFinite(angle)) return null
  const transit = approxTransit(isSet ? angle : -angle, westLongitude, cycle)
  return fromJulian(solarTransitJulian(transit, anomaly, longitude))
}

export const getSolarTimes = (value, location, timezone = 'Asia/Shanghai') => {
  const date = new Date(value)
  const latitudeValue = Number(location?.latitude)
  const longitudeValue = Number(location?.longitude)
  if (
    Number.isNaN(date.valueOf())
    || !Number.isFinite(latitudeValue)
    || !Number.isFinite(longitudeValue)
    || Math.abs(latitudeValue) > 90
    || Math.abs(longitudeValue) > 180
  ) return null

  let year
  let month
  let day
  try {
    [year, month, day] = getDateParts(date, timezone)
  } catch {
    [year, month, day] = getDateParts(date, 'Asia/Shanghai')
  }

  const referenceDate = new Date(Date.UTC(year, month - 1, day, 12))
  const westLongitude = -longitudeValue * RAD
  const latitude = latitudeValue * RAD
  const days = toDays(referenceDate)
  const cycle = julianCycle(days, westLongitude)
  const solarNoonTransit = approxTransit(0, westLongitude, cycle)
  const anomaly = solarMeanAnomaly(solarNoonTransit)
  const longitude = eclipticLongitude(anomaly)
  const solarDeclination = declination(longitude)
  const event = (altitude, isSet) => getSolarEvent(
    cycle,
    westLongitude,
    anomaly,
    longitude,
    latitude,
    solarDeclination,
    altitude * RAD,
    isSet,
  )

  return {
    dawn: event(-6, false),
    sunrise: event(-0.833, false),
    sunset: event(-0.833, true),
    dusk: event(-6, true),
  }
}

export const getSolarPeriod = (value, location, timezone) => {
  const date = new Date(value)
  const times = getSolarTimes(date, location, timezone)
  if (!times || Object.values(times).some(time => !time)) return null

  const sunriseEnds = new Date(times.sunrise.valueOf() + 30 * 60 * 1000)
  const sunsetStarts = new Date(times.sunset.valueOf() - 30 * 60 * 1000)

  if (date >= times.dawn && date < sunriseEnds) return 'sunrise'
  if (date >= sunriseEnds && date < sunsetStarts) return 'day'
  if (date >= sunsetStarts && date < times.dusk) return 'sunset'
  return 'night'
}
