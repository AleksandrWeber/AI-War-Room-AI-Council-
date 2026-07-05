import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const discernibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DiscernibilityRolloutCheckStatus = z.infer<
  typeof discernibilityRolloutCheckStatusSchema
>

export const discernibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: discernibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DiscernibilityRolloutCheck = z.infer<typeof discernibilityRolloutCheckSchema>

export const discernibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DiscernibilityRolloutStatus = z.infer<typeof discernibilityRolloutStatusSchema>

export const discernibilityCapabilitiesResponseSchema = z.object({
  supportsDiscernibilityRollout: z.literal(true),
  supportsDiscernibilityAdminTools: z.literal(true),
  supportsSynthesisDiscernibilitySignals: z.literal(true),
  supportsAgentOutputDiscernibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DiscernibilityCapabilitiesResponse = z.infer<
  typeof discernibilityCapabilitiesResponseSchema
>

export const discernibilityRolloutResponseSchema = z.object({
  status: discernibilityRolloutStatusSchema,
  checks: z.array(discernibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DiscernibilityRolloutResponse = z.infer<
  typeof discernibilityRolloutResponseSchema
>

export function getDiscernibilityRolloutGuidance() {
  return 'Production discernibility rollout validates synthesis discernibility, agent output discernibility signals, artifact coverage, and discernment readiness before production discernibility tooling.'
}
