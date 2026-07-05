import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const simplicityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SimplicityRolloutCheckStatus = z.infer<
  typeof simplicityRolloutCheckStatusSchema
>

export const simplicityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: simplicityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SimplicityRolloutCheck = z.infer<typeof simplicityRolloutCheckSchema>

export const simplicityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SimplicityRolloutStatus = z.infer<typeof simplicityRolloutStatusSchema>

export const simplicityCapabilitiesResponseSchema = z.object({
  supportsSimplicityRollout: z.literal(true),
  supportsSimplicityAdminTools: z.literal(true),
  supportsWorkflowSimplicitySignals: z.literal(true),
  supportsIdempotencyKeySimplicitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SimplicityCapabilitiesResponse = z.infer<
  typeof simplicityCapabilitiesResponseSchema
>

export const simplicityRolloutResponseSchema = z.object({
  status: simplicityRolloutStatusSchema,
  checks: z.array(simplicityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SimplicityRolloutResponse = z.infer<
  typeof simplicityRolloutResponseSchema
>

export function getSimplicityRolloutGuidance() {
  return 'Production simplicity rollout validates workflow simplicity, idempotency key simplicity signals, usage event coverage, and simplicity readiness before production simplicity tooling.'
}
