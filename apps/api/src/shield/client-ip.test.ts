import { describe, expect, it } from 'vitest'
import { extractClientIp } from './client-ip.js'

describe('extractClientIp', () => {
  it('prefers the first X-Forwarded-For hop', () => {
    expect(
      extractClientIp({
        ip: '10.0.0.1',
        headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
      }),
    ).toBe('203.0.113.9')
  })

  it('falls back to request.ip', () => {
    expect(
      extractClientIp({
        ip: '198.51.100.7',
        headers: {},
      }),
    ).toBe('198.51.100.7')
  })
})
