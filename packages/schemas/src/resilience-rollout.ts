import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const resilienceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ResilienceRolloutCheckStatus = z.infer<
  typeof resilienceRolloutCheckStatusSchema
>

export const resilienceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: resilienceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ResilienceRolloutCheck = z.infer<typeof resilienceRolloutCheckSchema>

export const resilienceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ResilienceRolloutStatus = z.infer<
  typeof resilienceRolloutStatusSchema
>

export const resilienceCapabilitiesResponseSchema = z.object({
  supportsResilienceRollout: z.literal(true),
  supportsResilienceAdminTools: z.literal(true),
  supportsRunWorkflowRecoverySignals: z.literal(true),
  supportsRedisRecoverySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ResilienceCapabilitiesResponse = z.infer<
  typeof resilienceCapabilitiesResponseSchema
>

export const resilienceRolloutResponseSchema = z.object({
  status: resilienceRolloutStatusSchema,
  checks: z.array(resilienceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ResilienceRolloutResponse = z.infer<
  typeof resilienceRolloutResponseSchema
>

export function getResilienceRolloutGuidance() {
  return 'Production resilience rollout validates run workflow recovery signals, migration prerequisites, Redis recovery buffers, and recovery readiness before production resilience tooling.'
}
