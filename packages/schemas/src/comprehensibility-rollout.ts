import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const comprehensibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComprehensibilityRolloutCheckStatus = z.infer<
  typeof comprehensibilityRolloutCheckStatusSchema
>

export const comprehensibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: comprehensibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComprehensibilityRolloutCheck = z.infer<typeof comprehensibilityRolloutCheckSchema>

export const comprehensibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComprehensibilityRolloutStatus = z.infer<typeof comprehensibilityRolloutStatusSchema>

export const comprehensibilityCapabilitiesResponseSchema = z.object({
  supportsComprehensibilityRollout: z.literal(true),
  supportsComprehensibilityAdminTools: z.literal(true),
  supportsAgentOutputComprehensibilitySignals: z.literal(true),
  supportsSynthesisComprehensibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComprehensibilityCapabilitiesResponse = z.infer<
  typeof comprehensibilityCapabilitiesResponseSchema
>

export const comprehensibilityRolloutResponseSchema = z.object({
  status: comprehensibilityRolloutStatusSchema,
  checks: z.array(comprehensibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComprehensibilityRolloutResponse = z.infer<
  typeof comprehensibilityRolloutResponseSchema
>

export function getComprehensibilityRolloutGuidance() {
  return 'Production comprehensibility rollout validates agent output comprehensibility, synthesis comprehensibility signals, artifact coverage, and comprehension readiness before production comprehensibility tooling.'
}
