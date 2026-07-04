import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const temporalRuntimeHealthStatusSchema = z.enum([
  'disabled',
  'unavailable',
  'degraded',
  'healthy',
])
export type TemporalRuntimeHealthStatus = z.infer<
  typeof temporalRuntimeHealthStatusSchema
>

export const temporalRuntimeHealthResponseSchema = z.object({
  status: temporalRuntimeHealthStatusSchema,
  temporalEnabled: z.boolean(),
  serverReachable: z.boolean(),
  workerPolling: z.boolean(),
  taskQueue: nonEmptyStringSchema,
  namespace: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  workerLastSeenAt: utcDateStringSchema.optional(),
  checkedAt: utcDateStringSchema,
  guidance: nonEmptyStringSchema,
})
export type TemporalRuntimeHealthResponse = z.infer<
  typeof temporalRuntimeHealthResponseSchema
>

export function getTemporalHealthGuidance(
  status: TemporalRuntimeHealthStatus,
): string {
  switch (status) {
    case 'disabled':
      return 'Temporal is disabled. Set TEMPORAL_ENABLED=true to use durable workflow execution.'
    case 'unavailable':
      return 'Temporal server is unreachable. Start the local Temporal server or verify TEMPORAL_ADDRESS.'
    case 'degraded':
      return 'Temporal server is reachable, but no worker heartbeat was detected. Start npm run worker:temporal:dev.'
    case 'healthy':
      return 'Temporal server and worker heartbeat look healthy for the configured task queue.'
  }
}

export function resolveTemporalRuntimeHealthStatus(input: {
  temporalEnabled: boolean
  serverReachable: boolean
  workerPolling: boolean
}): TemporalRuntimeHealthStatus {
  if (!input.temporalEnabled) {
    return 'disabled'
  }

  if (!input.serverReachable) {
    return 'unavailable'
  }

  if (!input.workerPolling) {
    return 'degraded'
  }

  return 'healthy'
}
