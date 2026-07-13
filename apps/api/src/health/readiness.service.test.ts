import { describe, expect, it, vi } from 'vitest'
import { ReadinessService } from './readiness.service.js'

function createConfigService(temporalEnabled: boolean) {
  return {
    get(key: string) {
      if (key === 'TEMPORAL_ENABLED') {
        return temporalEnabled
      }

      if (key === 'TEMPORAL_ADDRESS') {
        return '127.0.0.1:7233'
      }

      if (key === 'TEMPORAL_NAMESPACE') {
        return 'default'
      }

      if (key === 'TEMPORAL_TASK_QUEUE') {
        return 'ai-war-room-runs'
      }

      return undefined
    },
  } as never
}

describe('ReadinessService', () => {
  it('reports ready when postgres and redis are reachable', async () => {
    const service = new ReadinessService(
      {
        ping: vi.fn(async () => undefined),
      } as never,
      {
        ping: vi.fn(async () => true),
      } as never,
      createConfigService(false),
      {
        getRuntimeHealth: vi.fn(),
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

  it('requires Temporal when TEMPORAL_ENABLED is true', async () => {
    const service = new ReadinessService(
      {
        ping: vi.fn(async () => undefined),
      } as never,
      {
        ping: vi.fn(async () => true),
      } as never,
      createConfigService(true),
      {
        getRuntimeHealth: vi.fn(async () => ({
          serverReachable: false,
          guidance: 'Temporal server unreachable.',
        })),
      } as never,
    )

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'not_ready',
      dependencies: expect.arrayContaining([
        expect.objectContaining({
          name: 'temporal',
          status: 'down',
        }),
      ]),
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
      createConfigService(false),
      {
        getRuntimeHealth: vi.fn(),
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
      createConfigService(false),
      {
        getRuntimeHealth: vi.fn(),
      } as never,
    )

    await expect(service.requireReady()).rejects.toMatchObject({
      status: 503,
    })
  })
})
