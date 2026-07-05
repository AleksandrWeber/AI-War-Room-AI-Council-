import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const persistizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PersistizabilityRolloutCheckStatus = z.infer<
  typeof persistizabilityRolloutCheckStatusSchema
>

export const persistizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: persistizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PersistizabilityRolloutCheck = z.infer<typeof persistizabilityRolloutCheckSchema>

export const persistizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PersistizabilityRolloutStatus = z.infer<typeof persistizabilityRolloutStatusSchema>

export const persistizabilityCapabilitiesResponseSchema = z.object({
  supportsPersistizabilityRollout: z.literal(true),
  supportsPersistizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyPersistizabilitySignals: z.literal(true),
  supportsUsageEventPersistizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PersistizabilityCapabilitiesResponse = z.infer<
  typeof persistizabilityCapabilitiesResponseSchema
>

export const persistizabilityRolloutResponseSchema = z.object({
  status: persistizabilityRolloutStatusSchema,
  checks: z.array(persistizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PersistizabilityRolloutResponse = z.infer<
  typeof persistizabilityRolloutResponseSchema
>

export function getPersistizabilityRolloutGuidance() {
  return 'Production persistizability rollout validates idempotency key persistizability, usage event persistizability signals, billing webhook coverage, and persistization readiness before production persistizability tooling.'
}
