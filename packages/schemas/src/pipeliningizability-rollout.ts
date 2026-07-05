import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const pipeliningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PipeliningizabilityRolloutCheckStatus = z.infer<
  typeof pipeliningizabilityRolloutCheckStatusSchema
>

export const pipeliningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: pipeliningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PipeliningizabilityRolloutCheck = z.infer<typeof pipeliningizabilityRolloutCheckSchema>

export const pipeliningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PipeliningizabilityRolloutStatus = z.infer<typeof pipeliningizabilityRolloutStatusSchema>

export const pipeliningizabilityCapabilitiesResponseSchema = z.object({
  supportsPipeliningizabilityRollout: z.literal(true),
  supportsPipeliningizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyPipeliningizabilitySignals: z.literal(true),
  supportsUsageEventPipeliningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PipeliningizabilityCapabilitiesResponse = z.infer<
  typeof pipeliningizabilityCapabilitiesResponseSchema
>

export const pipeliningizabilityRolloutResponseSchema = z.object({
  status: pipeliningizabilityRolloutStatusSchema,
  checks: z.array(pipeliningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PipeliningizabilityRolloutResponse = z.infer<
  typeof pipeliningizabilityRolloutResponseSchema
>

export function getPipeliningizabilityRolloutGuidance() {
  return 'Production pipeliningizability rollout validates idempotency key pipeliningizability, usage event pipeliningizability signals, billing webhook coverage, and pipeliningization readiness before production pipeliningizability tooling.'
}
