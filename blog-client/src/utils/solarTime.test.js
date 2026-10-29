import assert from 'node:assert/strict'
import test from 'node:test'
import { getSolarPeriod, getSolarTimes } from './solarTime.js'

const shenzhen = { latitude: 22.5431, longitude: 114.0579 }

test('calculates historical sunrise and sunset for Shenzhen', () => {
  const times = getSolarTimes('2026-10-29T12:00:00+08:00', shenzhen, 'Asia/Shanghai')

  assert.equal(times.sunrise.toISOString(), '2026-10-28T22:27:30.758Z')
  assert.equal(times.sunset.toISOString(), '2026-10-29T09:49:56.469Z')
})

test('uses twilight windows for time icons', () => {
  assert.equal(getSolarPeriod('2026-10-29T06:15:00+08:00', shenzhen, 'Asia/Shanghai'), 'sunrise')
  assert.equal(getSolarPeriod('2026-10-29T12:00:00+08:00', shenzhen, 'Asia/Shanghai'), 'day')
  assert.equal(getSolarPeriod('2026-10-29T17:40:00+08:00', shenzhen, 'Asia/Shanghai'), 'sunset')
  assert.equal(getSolarPeriod('2026-10-29T22:20:00+08:00', shenzhen, 'Asia/Shanghai'), 'night')
})

test('returns null when historical content has no usable location', () => {
  assert.equal(getSolarPeriod('2026-10-29T12:00:00+08:00', null, 'Asia/Shanghai'), null)
})
