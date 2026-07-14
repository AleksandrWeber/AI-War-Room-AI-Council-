import { describe, expect, it } from 'vitest'
import { HttpException } from '@nestjs/common'
import { ShieldIpAbuseService } from './shield-ip-abuse.service.js'

function createService() {
  const configService = {
    get: () => 'test',
  }
  const observabilityService = {
    record: () => undefined,
  }

  return new ShieldIpAbuseService(
    configService as never,
    observabilityService as never,
  )
}

describe('ShieldIpAbuseService', () => {
  it('allows editing and only blocks after 3 critical attempts (2h first)', async () => {
    const service = createService()
    const ip = '203.0.113.10'

    await service.assertIpAllowed(ip)

    await expect(service.recordCriticalAttempt(ip)).resolves.toMatchObject({
      strikes: 1,
      blocked: false,
    })
    await expect(service.recordCriticalAttempt(ip)).resolves.toMatchObject({
      strikes: 2,
      blocked: false,
    })
    await expect(service.recordCriticalAttempt(ip)).resolves.toMatchObject({
      strikes: 3,
      blocked: true,
      blockDurationSeconds: 2 * 60 * 60,
    })

    await expect(service.assertIpAllowed(ip)).rejects.toBeInstanceOf(HttpException)

    try {
      await service.assertIpAllowed(ip)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
      const response = (error as HttpException).getResponse() as {
        code?: string
        retryAfterSeconds?: number
      }
      expect(response.code).toBe('ip_threat_rate_limited')
      expect(response.retryAfterSeconds).toBeGreaterThan(0)
    }
  })

  it('escalates a repeated trip to a 24h block', async () => {
    const service = createService()
    const ip = '198.51.100.20'

    for (let index = 0; index < 3; index += 1) {
      await service.recordCriticalAttempt(ip)
    }

    // Simulate first ban ending by clearing local block via private map through new attempts:
    // Force unlock by recording against assert after manually waiting is hard; instead use
    // a second service instance sharing no state — re-seed tier via first cycle then
    // clear block map through casting.
    const localBlocks = (
      service as unknown as {
        localBlocks: Map<string, { untilMs: number; durationSeconds: number }>
      }
    ).localBlocks
    localBlocks.delete(ip.toLowerCase())

    await service.assertIpAllowed(ip)

    for (let index = 0; index < 2; index += 1) {
      await service.recordCriticalAttempt(ip)
    }

    await expect(service.recordCriticalAttempt(ip)).resolves.toMatchObject({
      strikes: 3,
      blocked: true,
      blockDurationSeconds: 24 * 60 * 60,
    })
  })
})
