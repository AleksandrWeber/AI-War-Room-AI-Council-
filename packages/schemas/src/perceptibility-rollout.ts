import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const perceptibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PerceptibilityRolloutCheckStatus = z.infer<
  typeof perceptibilityRolloutCheckStatusSchema
>

export const perceptibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: perceptibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PerceptibilityRolloutCheck = z.infer<typeof perceptibilityRolloutCheckSchema>

export const perceptibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PerceptibilityRolloutStatus = z.infer<typeof perceptibilityRolloutStatusSchema>

export const perceptibilityCapabilitiesResponseSchema = z.object({
  supportsPerceptibilityRollout: z.literal(true),
  supportsPerceptibilityAdminTools: z.literal(true),
  supportsUsageEventPerceptibilitySignals: z.literal(true),
  supportsMeterUsagePerceptibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PerceptibilityCapabilitiesResponse = z.infer<
  typeof perceptibilityCapabilitiesResponseSchema
>

export const perceptibilityRolloutResponseSchema = z.object({
  status: perceptibilityRolloutStatusSchema,
  checks: z.array(perceptibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PerceptibilityRolloutResponse = z.infer<
  typeof perceptibilityRolloutResponseSchema
>

export function getPerceptibilityRolloutGuidance() {
  return 'Production perceptibility rollout validates usage event perceptibility, meter usage perceptibility signals, workspace limit coverage, and perception readiness before production perceptibility tooling.'
}
