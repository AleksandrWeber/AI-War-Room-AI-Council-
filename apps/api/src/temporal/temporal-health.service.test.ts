import type { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityService } from '../observability/observability.service.js'
import { TemporalHealthService } from './temporal-health.service.js'
import { TemporalWorkerHeartbeatService } from './temporal-worker-heartbeat.service.js'
import type { TemporalRunClient } from './temporal-run-client.js'

function createConfigService(enabled: boolean) {
  const values = {
    TEMPORAL_ENABLED: enabled,
    TEMPORAL_ADDRESS: '127.0.0.1:7233',
    TEMPORAL_NAMESPACE: 'default',
    TEMPORAL_TASK_QUEUE: 'ai-war-room-runs',
    NODE_ENV: 'test',
    REDIS_URL: 'redis://127.0.0.1:6379',
  }

  return {
    get(key: keyof typeof values) {
      return values[key]
    },
  } as ConfigService<ApiEnv, true>
}

function createObservabilityService() {
  return {
    measure(
      _eventName: string,
      _attributes: Record<string, string | number | boolean | null>,
      operation: () => Promise<unknown>,
    ) {
      return operation()
    },
  } as ObservabilityService
}

function createService(input: {
  enabled: boolean
  serverReachable: boolean
  heartbeat?: { lastSeenAt: string }
}) {
  const temporalWorkerHeartbeatService = new TemporalWorkerHeartbeatService(
    createConfigService(input.enabled),
  )

  if (input.heartbeat) {
    vi.spyOn(temporalWorkerHeartbeatService, 'getLatestHeartbeat').mockResolvedValue({
      taskQueue: 'ai-war-room-runs',
      lastSeenAt: input.heartbeat.lastSeenAt,
    })
  } else {
    vi.spyOn(temporalWorkerHeartbeatService, 'getLatestHeartbeat').mockResolvedValue(null)
  }

  const temporalRunClient: TemporalRunClient = {
    startDurableRun: vi.fn(),
    describeDurableRun: vi.fn(),
    checkServerReachable: vi.fn(async () => input.serverReachable),
  }

  const service = new TemporalHealthService(
    createConfigService(input.enabled),
    createObservabilityService(),
    temporalWorkerHeartbeatService,
    temporalRunClient,
  )

  return {
    service,
    temporalRunClient,
  }
}

describe('TemporalHealthService', () => {
  it('reports disabled runtime health when Temporal is off', async () => {
    const { service } = createService({
      enabled: false,
      serverReachable: false,
    })

    await expect(service.getRuntimeHealth()).resolves.toMatchObject({
      status: 'disabled',
      temporalEnabled: false,
      guidance: expect.stringContaining('TEMPORAL_ENABLED=true'),
    })
  })

  it('reports degraded health when the server is reachable but no worker heartbeat exists', async () => {
    const { service } = createService({
      enabled: true,
      serverReachable: true,
    })

    await expect(service.getRuntimeHealth()).resolves.toMatchObject({
      status: 'degraded',
      serverReachable: true,
      workerPolling: false,
      guidance: expect.stringContaining('worker'),
    })
  })

  it('reports healthy runtime health when server and worker heartbeat are available', async () => {
    const { service } = createService({
      enabled: true,
      serverReachable: true,
      heartbeat: { lastSeenAt: new Date().toISOString() },
    })

    await expect(service.getRuntimeHealth()).resolves.toMatchObject({
      status: 'healthy',
      serverReachable: true,
      workerPolling: true,
      workerLastSeenAt: expect.any(String),
      guidance: expect.stringContaining('healthy'),
    })
  })

  it('reports unavailable health when the Temporal server cannot be reached', async () => {
    const { service } = createService({
      enabled: true,
      serverReachable: false,
    })

    await expect(service.getRuntimeHealth()).resolves.toMatchObject({
      status: 'unavailable',
      serverReachable: false,
      guidance: expect.stringContaining('unreachable'),
    })
  })
})
