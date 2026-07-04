import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { temporalRuntimeHealthStatusSchema } from './temporal-health.js'

export const temporalRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TemporalRolloutCheckStatus = z.infer<
  typeof temporalRolloutCheckStatusSchema
>

export const temporalRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: temporalRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TemporalRolloutCheck = z.infer<typeof temporalRolloutCheckSchema>

export const temporalRolloutStatusSchema = z.enum([
  'ready',
  'not_ready',
  'disabled',
])
export type TemporalRolloutStatus = z.infer<typeof temporalRolloutStatusSchema>

export const temporalCapabilitiesResponseSchema = z.object({
  temporalEnabled: z.boolean(),
  address: nonEmptyStringSchema,
  namespace: nonEmptyStringSchema,
  taskQueue: nonEmptyStringSchema,
  workflowStreamPollMs: z.number().int().positive(),
  workflowStreamTimeoutMs: z.number().int().positive(),
  supportsTemporalRollout: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TemporalCapabilitiesResponse = z.infer<
  typeof temporalCapabilitiesResponseSchema
>

export const temporalRolloutResponseSchema = z.object({
  status: temporalRolloutStatusSchema,
  temporalEnabled: z.boolean(),
  runtimeStatus: temporalRuntimeHealthStatusSchema.optional(),
  checks: z.array(temporalRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TemporalRolloutResponse = z.infer<typeof temporalRolloutResponseSchema>

export function getTemporalRolloutGuidance(input: {
  temporalEnabled: boolean
}) {
  if (!input.temporalEnabled) {
    return 'Temporal is disabled. Set TEMPORAL_ENABLED=true to activate durable workflow rollout checks.'
  }

  return 'Temporal durable workflows are enabled. Verify server reachability and worker heartbeat before production rollout.'
}
