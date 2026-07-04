import type { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'

function createConfigService(values: {
  TEMPORAL_ADDRESS: string
  TEMPORAL_NAMESPACE: string
  TEMPORAL_TASK_QUEUE: string
}) {
  return {
    get(key: keyof typeof values) {
      return values[key]
    },
  } as ConfigService<ApiEnv, true>
}

describe('temporal worker config', () => {
  it('maps env-backed config into worker options', () => {
    const config = getTemporalWorkerConfig(
      createConfigService({
        TEMPORAL_ADDRESS: '127.0.0.1:7233',
        TEMPORAL_NAMESPACE: 'default',
        TEMPORAL_TASK_QUEUE: 'ai-war-room-runs',
      }),
    )

    expect(config).toMatchObject({
      address: '127.0.0.1:7233',
      namespace: 'default',
      taskQueue: 'ai-war-room-runs',
    })
    expect(config.workflowsPath).toContain('durable-run.workflow.js')
  })
})
