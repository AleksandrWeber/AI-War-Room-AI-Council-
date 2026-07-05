import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const legibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LegibilityRolloutCheckStatus = z.infer<
  typeof legibilityRolloutCheckStatusSchema
>

export const legibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: legibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LegibilityRolloutCheck = z.infer<typeof legibilityRolloutCheckSchema>

export const legibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LegibilityRolloutStatus = z.infer<typeof legibilityRolloutStatusSchema>

export const legibilityCapabilitiesResponseSchema = z.object({
  supportsLegibilityRollout: z.literal(true),
  supportsLegibilityAdminTools: z.literal(true),
  supportsArtifactLegibilitySignals: z.literal(true),
  supportsWorkflowLegibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LegibilityCapabilitiesResponse = z.infer<
  typeof legibilityCapabilitiesResponseSchema
>

export const legibilityRolloutResponseSchema = z.object({
  status: legibilityRolloutStatusSchema,
  checks: z.array(legibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LegibilityRolloutResponse = z.infer<
  typeof legibilityRolloutResponseSchema
>

export function getLegibilityRolloutGuidance() {
  return 'Production legibility rollout validates artifact legibility, workflow legibility signals, usage event coverage, and legibility readiness before production legibility tooling.'
}
