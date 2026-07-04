import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTemporalHealthGuidance,
  resolveTemporalRuntimeHealthStatus,
  temporalRuntimeHealthResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import {
  TEMPORAL_RUN_CLIENT,
  type TemporalRunClient,
} from './temporal-run-client.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'
import { TemporalWorkerHeartbeatService } from './temporal-worker-heartbeat.service.js'

@Injectable()
export class TemporalHealthService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly observabilityService: ObservabilityService,
    private readonly temporalWorkerHeartbeatService: TemporalWorkerHeartbeatService,
    @Inject(TEMPORAL_RUN_CLIENT)
    private readonly temporalRunClient: TemporalRunClient,
  ) {}

  async getRuntimeHealth() {
    const workerConfig = getTemporalWorkerConfig(this.configService)
    const checkedAt = new Date().toISOString()

    if (!workerConfig.enabled) {
      const status = resolveTemporalRuntimeHealthStatus({
        temporalEnabled: false,
        serverReachable: false,
        workerPolling: false,
      })

      return temporalRuntimeHealthResponseSchema.parse({
        status,
        temporalEnabled: false,
        serverReachable: false,
        workerPolling: false,
        taskQueue: workerConfig.taskQueue,
        namespace: workerConfig.namespace,
        address: workerConfig.address,
        checkedAt,
        guidance: getTemporalHealthGuidance(status),
      })
    }

    const serverReachable = await this.observabilityService.measure(
      'temporal_runtime_health_checked',
      {
        taskQueue: workerConfig.taskQueue,
        namespace: workerConfig.namespace,
      },
      () =>
        this.temporalRunClient.checkServerReachable({
          address: workerConfig.address,
        }),
    )
    const heartbeat = await this.temporalWorkerHeartbeatService.getLatestHeartbeat(
      workerConfig.taskQueue,
    )
    const workerPolling = heartbeat
      ? this.temporalWorkerHeartbeatService.isRecentHeartbeat(heartbeat.lastSeenAt)
      : false
    const status = resolveTemporalRuntimeHealthStatus({
      temporalEnabled: true,
      serverReachable,
      workerPolling,
    })

    return temporalRuntimeHealthResponseSchema.parse({
      status,
      temporalEnabled: true,
      serverReachable,
      workerPolling,
      taskQueue: workerConfig.taskQueue,
      namespace: workerConfig.namespace,
      address: workerConfig.address,
      workerLastSeenAt: heartbeat?.lastSeenAt,
      checkedAt,
      guidance: getTemporalHealthGuidance(status),
    })
  }
}
