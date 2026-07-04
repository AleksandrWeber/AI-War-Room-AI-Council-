import type { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { TemporalWorkerHeartbeatService } from './temporal-worker-heartbeat.service.js'

function createConfigService() {
  return {
    get(key: keyof ApiEnv) {
      if (key === 'NODE_ENV') {
        return 'test'
      }

      return 'redis://127.0.0.1:6379'
    },
  } as ConfigService<ApiEnv, true>
}

describe('TemporalWorkerHeartbeatService', () => {
  it('stores and reads recent worker heartbeats in test mode', async () => {
    const service = new TemporalWorkerHeartbeatService(createConfigService())

    await service.recordHeartbeat('ai-war-room-runs')

    await expect(service.getLatestHeartbeat('ai-war-room-runs')).resolves.toMatchObject({
      taskQueue: 'ai-war-room-runs',
      lastSeenAt: expect.any(String),
    })
    expect(
      service.isRecentHeartbeat(new Date().toISOString()),
    ).toBe(true)
  })
})
