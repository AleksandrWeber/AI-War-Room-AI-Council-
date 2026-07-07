import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const witnessjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WitnessjournalizabilityRolloutCheckStatus = z.infer<
  typeof witnessjournalizabilityRolloutCheckStatusSchema
>

export const witnessjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: witnessjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WitnessjournalizabilityRolloutCheck = z.infer<typeof witnessjournalizabilityRolloutCheckSchema>

export const witnessjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WitnessjournalizabilityRolloutStatus = z.infer<typeof witnessjournalizabilityRolloutStatusSchema>

export const witnessjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsWitnessjournalizabilityRollout: z.literal(true),
  supportsWitnessjournalizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyWitnessjournalizabilitySignals: z.literal(true),
  supportsUsageEventWitnessjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WitnessjournalizabilityCapabilitiesResponse = z.infer<
  typeof witnessjournalizabilityCapabilitiesResponseSchema
>

export const witnessjournalizabilityRolloutResponseSchema = z.object({
  status: witnessjournalizabilityRolloutStatusSchema,
  checks: z.array(witnessjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WitnessjournalizabilityRolloutResponse = z.infer<
  typeof witnessjournalizabilityRolloutResponseSchema
>

export function getWitnessjournalizabilityRolloutGuidance() {
  return 'Production witnessjournalizability rollout validates idempotency key witnessjournalizability, usage event witnessjournalizability signals, billing webhook coverage, and remediationization readiness before production witnessjournalizability tooling.'
}
