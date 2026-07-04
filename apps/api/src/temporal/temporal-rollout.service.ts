import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTemporalRolloutGuidance,
  temporalCapabilitiesResponseSchema,
  temporalRolloutResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'
import { TemporalHealthService } from './temporal-health.service.js'
import { evaluateTemporalRollout } from './temporal-rollout.helpers.js'

@Injectable()
export class TemporalRolloutService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly temporalHealthService: TemporalHealthService,
  ) {}

  getCapabilities() {
    const workerConfig = getTemporalWorkerConfig(this.configService)

    return temporalCapabilitiesResponseSchema.parse({
      temporalEnabled: workerConfig.enabled,
      address: workerConfig.address,
      namespace: workerConfig.namespace,
      taskQueue: workerConfig.taskQueue,
      workflowStreamPollMs: this.configService.get(
        'TEMPORAL_WORKFLOW_STREAM_POLL_MS',
        { infer: true },
      ),
      workflowStreamTimeoutMs: this.configService.get(
        'TEMPORAL_WORKFLOW_STREAM_TIMEOUT_MS',
        { infer: true },
      ),
      supportsTemporalRollout: true,
      guidance: getTemporalRolloutGuidance({
        temporalEnabled: workerConfig.enabled,
      }),
    })
  }

  async getTemporalRollout() {
    const workerConfig = getTemporalWorkerConfig(this.configService)
    const health = workerConfig.enabled
      ? await this.temporalHealthService.getRuntimeHealth()
      : null
    const rollout = evaluateTemporalRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      temporalEnabled: workerConfig.enabled,
      temporalAddress: workerConfig.address,
      temporalNamespace: workerConfig.namespace,
      temporalTaskQueue: workerConfig.taskQueue,
      workflowStreamPollMs: this.configService.get(
        'TEMPORAL_WORKFLOW_STREAM_POLL_MS',
        { infer: true },
      ),
      workflowStreamTimeoutMs: this.configService.get(
        'TEMPORAL_WORKFLOW_STREAM_TIMEOUT_MS',
        { infer: true },
      ),
      serverReachable: health?.serverReachable,
      workerPolling: health?.workerPolling,
    })

    return temporalRolloutResponseSchema.parse({
      ...rollout,
      temporalEnabled: workerConfig.enabled,
      runtimeStatus: health?.status,
      checkedAt: new Date().toISOString(),
    })
  }
}
