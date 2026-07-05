import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const intelligibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntelligibilityRolloutCheckStatus = z.infer<
  typeof intelligibilityRolloutCheckStatusSchema
>

export const intelligibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: intelligibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntelligibilityRolloutCheck = z.infer<typeof intelligibilityRolloutCheckSchema>

export const intelligibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntelligibilityRolloutStatus = z.infer<typeof intelligibilityRolloutStatusSchema>

export const intelligibilityCapabilitiesResponseSchema = z.object({
  supportsIntelligibilityRollout: z.literal(true),
  supportsIntelligibilityAdminTools: z.literal(true),
  supportsSynthesisIntelligibilitySignals: z.literal(true),
  supportsAgentOutputIntelligibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntelligibilityCapabilitiesResponse = z.infer<
  typeof intelligibilityCapabilitiesResponseSchema
>

export const intelligibilityRolloutResponseSchema = z.object({
  status: intelligibilityRolloutStatusSchema,
  checks: z.array(intelligibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntelligibilityRolloutResponse = z.infer<
  typeof intelligibilityRolloutResponseSchema
>

export function getIntelligibilityRolloutGuidance() {
  return 'Production intelligibility rollout validates synthesis intelligibility, agent output intelligibility signals, artifact coverage, and intelligibility readiness before production intelligibility tooling.'
}
