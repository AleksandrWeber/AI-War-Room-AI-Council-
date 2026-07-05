import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const allegorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AllegorizabilityRolloutCheckStatus = z.infer<
  typeof allegorizabilityRolloutCheckStatusSchema
>

export const allegorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: allegorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AllegorizabilityRolloutCheck = z.infer<typeof allegorizabilityRolloutCheckSchema>

export const allegorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AllegorizabilityRolloutStatus = z.infer<typeof allegorizabilityRolloutStatusSchema>

export const allegorizabilityCapabilitiesResponseSchema = z.object({
  supportsAllegorizabilityRollout: z.literal(true),
  supportsAllegorizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAllegorizabilitySignals: z.literal(true),
  supportsUsageEventAllegorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AllegorizabilityCapabilitiesResponse = z.infer<
  typeof allegorizabilityCapabilitiesResponseSchema
>

export const allegorizabilityRolloutResponseSchema = z.object({
  status: allegorizabilityRolloutStatusSchema,
  checks: z.array(allegorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AllegorizabilityRolloutResponse = z.infer<
  typeof allegorizabilityRolloutResponseSchema
>

export function getAllegorizabilityRolloutGuidance() {
  return 'Production allegorizability rollout validates idempotency key allegorizability, usage event allegorizability signals, billing webhook coverage, and allegorization readiness before production allegorizability tooling.'
}
