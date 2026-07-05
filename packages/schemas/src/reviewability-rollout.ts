import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reviewabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReviewabilityRolloutCheckStatus = z.infer<
  typeof reviewabilityRolloutCheckStatusSchema
>

export const reviewabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reviewabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReviewabilityRolloutCheck = z.infer<typeof reviewabilityRolloutCheckSchema>

export const reviewabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReviewabilityRolloutStatus = z.infer<typeof reviewabilityRolloutStatusSchema>

export const reviewabilityCapabilitiesResponseSchema = z.object({
  supportsReviewabilityRollout: z.literal(true),
  supportsReviewabilityAdminTools: z.literal(true),
  supportsArtifactReviewabilitySignals: z.literal(true),
  supportsAgentOutputReviewabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReviewabilityCapabilitiesResponse = z.infer<
  typeof reviewabilityCapabilitiesResponseSchema
>

export const reviewabilityRolloutResponseSchema = z.object({
  status: reviewabilityRolloutStatusSchema,
  checks: z.array(reviewabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReviewabilityRolloutResponse = z.infer<
  typeof reviewabilityRolloutResponseSchema
>

export function getReviewabilityRolloutGuidance() {
  return 'Production reviewability rollout validates artifact reviewability, agent output reviewability signals, billing invoice coverage, and assessment readiness before production reviewability tooling.'
}
