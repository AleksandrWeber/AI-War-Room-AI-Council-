import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const defensibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DefensibilityRolloutCheckStatus = z.infer<
  typeof defensibilityRolloutCheckStatusSchema
>

export const defensibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: defensibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DefensibilityRolloutCheck = z.infer<typeof defensibilityRolloutCheckSchema>

export const defensibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DefensibilityRolloutStatus = z.infer<typeof defensibilityRolloutStatusSchema>

export const defensibilityCapabilitiesResponseSchema = z.object({
  supportsDefensibilityRollout: z.literal(true),
  supportsDefensibilityAdminTools: z.literal(true),
  supportsShieldReviewDefensibilitySignals: z.literal(true),
  supportsArtifactDefensibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DefensibilityCapabilitiesResponse = z.infer<
  typeof defensibilityCapabilitiesResponseSchema
>

export const defensibilityRolloutResponseSchema = z.object({
  status: defensibilityRolloutStatusSchema,
  checks: z.array(defensibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DefensibilityRolloutResponse = z.infer<
  typeof defensibilityRolloutResponseSchema
>

export function getDefensibilityRolloutGuidance() {
  return 'Production defensibility rollout validates shield review defensibility, artifact defensibility signals, moderator synthesis coverage, and justification readiness before production defensibility tooling.'
}
