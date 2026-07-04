import { fileURLToPath } from 'node:url'
import type { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'

export type TemporalWorkerConfig = {
  address: string
  namespace: string
  taskQueue: string
  workflowsPath: string
}

export function getTemporalWorkerConfig(
  configService: ConfigService<ApiEnv, true>,
): TemporalWorkerConfig {
  return {
    address: configService.get('TEMPORAL_ADDRESS', { infer: true }),
    namespace: configService.get('TEMPORAL_NAMESPACE', { infer: true }),
    taskQueue: configService.get('TEMPORAL_TASK_QUEUE', { infer: true }),
    workflowsPath: fileURLToPath(
      new URL('./durable-run.workflow.js', import.meta.url),
    ),
  }
}
