import { describe, expect, it, vi } from 'vitest'
import { ReadinessService } from './readiness.service.js'

describe('ReadinessService', () => {
  it('reports ready when postgres and redis are reachable', async () => {
    const service = new ReadinessService(
      {
        ping: vi.fn(async () => undefined),
      } as never,
      {
        ping: vi.fn(async () => true),
      } as never,
    )

    await expect(service.getReadiness()).resolves.toMatchObject({
      service: 'ai-war-room-api',
      status: 'ready',
      dependencies: [
        { name: 'postgres', status: 'up' },
        { name: 'redis', status: 'up' },
      ],
    })
  })

  it('reports not ready when a dependency is down', async () => {
    const service = new ReadinessService(
      {
        ping: vi.fn(async () => {
          throw new Error('connection refused')
        }),
      } as never,
      {
        ping: vi.fn(async () => true),
      } as never,
    )

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'not_ready',
      dependencies: expect.arrayContaining([
        expect.objectContaining({
          name: 'postgres',
          status: 'down',
        }),
      ]),
    })
  })

  it('throws a service unavailable error when readiness is required but failing', async () => {
    const service = new ReadinessService(
      {
        ping: vi.fn(async () => undefined),
      } as never,
      {
        ping: vi.fn(async () => false),
      } as never,
    )

    await expect(service.requireReady()).rejects.toMatchObject({
      status: 503,
    })
  })
})
