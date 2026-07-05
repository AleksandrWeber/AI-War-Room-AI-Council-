import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const parsabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ParsabilityRolloutCheckStatus = z.infer<
  typeof parsabilityRolloutCheckStatusSchema
>

export const parsabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: parsabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ParsabilityRolloutCheck = z.infer<typeof parsabilityRolloutCheckSchema>

export const parsabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ParsabilityRolloutStatus = z.infer<typeof parsabilityRolloutStatusSchema>

export const parsabilityCapabilitiesResponseSchema = z.object({
  supportsParsabilityRollout: z.literal(true),
  supportsParsabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyParsabilitySignals: z.literal(true),
  supportsUsageEventParsabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ParsabilityCapabilitiesResponse = z.infer<
  typeof parsabilityCapabilitiesResponseSchema
>

export const parsabilityRolloutResponseSchema = z.object({
  status: parsabilityRolloutStatusSchema,
  checks: z.array(parsabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ParsabilityRolloutResponse = z.infer<
  typeof parsabilityRolloutResponseSchema
>

export function getParsabilityRolloutGuidance() {
  return 'Production parsability rollout validates idempotency key parsability, usage event parsability signals, billing webhook coverage, and parsing readiness before production parsability tooling.'
}
