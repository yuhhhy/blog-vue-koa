import assert from 'node:assert/strict'
import test from 'node:test'
import { getSolarPeriod, getSolarTimes } from './solarTime.js'

const shenzhen = { latitude: 22.5431, longitude: 114.0579 }

test('calculates historical sunrise and sunset for Shenzhen', () => {
    const times = getSolarTimes(
        '2026-10-29T12:00:00+08:00',
        shenzhen,
        'Asia/Shanghai',
    )

    assert.equal(times.sunrise.toISOString(), '2026-10-28T22:27:30.758Z')
    assert.equal(times.sunset.toISOString(), '2026-10-29T09:49:56.469Z')
})

test('uses twilight windows for time icons', () => {
    assert.equal(
        getSolarPeriod('2026-10-29T06:15:00+08:00', shenzhen, 'Asia/Shanghai'),
        'sunrise',
    )
    assert.equal(
        getSolarPeriod('2026-10-29T12:00:00+08:00', shenzhen, 'Asia/Shanghai'),
        'day',
    )
    assert.equal(
        getSolarPeriod('2026-10-29T17:40:00+08:00', shenzhen, 'Asia/Shanghai'),
        'sunset',
    )
    assert.equal(
        getSolarPeriod('2026-10-29T22:20:00+08:00', shenzhen, 'Asia/Shanghai'),
        'night',
    )
})

test('returns null when historical content has no usable location', () => {
    assert.equal(
        getSolarPeriod('2026-10-29T12:00:00+08:00', null, 'Asia/Shanghai'),
        null,
    )
})

test('splits solar nights at local midnight and 05:00', () => {
    for (const [time, period] of [
        ['2026-10-28T23:59:59+08:00', 'night'],
        ['2026-10-29T00:00:00+08:00', 'deepNight'],
        ['2026-10-29T02:00:00+08:00', 'deepNight'],
        ['2026-10-29T04:59:59+08:00', 'deepNight'],
        ['2026-10-29T05:00:00+08:00', 'night'],
    ]) {
        assert.equal(getSolarPeriod(time, shenzhen, 'Asia/Shanghai'), period)
    }
})

test('uses the supplied timezone and falls back for invalid timezones', () => {
    const value = '2026-10-28T18:00:00Z'
    assert.equal(getSolarPeriod(value, shenzhen, 'Asia/Shanghai'), 'deepNight')
    assert.equal(getSolarPeriod(value, shenzhen, 'UTC'), 'night')
    assert.equal(getSolarPeriod(value, shenzhen, 'invalid'), 'deepNight')
})
