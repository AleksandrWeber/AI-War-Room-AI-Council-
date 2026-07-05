import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const effectivenessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EffectivenessRolloutCheckStatus = z.infer<
  typeof effectivenessRolloutCheckStatusSchema
>

export const effectivenessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: effectivenessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EffectivenessRolloutCheck = z.infer<typeof effectivenessRolloutCheckSchema>

export const effectivenessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EffectivenessRolloutStatus = z.infer<typeof effectivenessRolloutStatusSchema>

export const effectivenessCapabilitiesResponseSchema = z.object({
  supportsEffectivenessRollout: z.literal(true),
  supportsEffectivenessAdminTools: z.literal(true),
  supportsAgentOutputEffectivenessSignals: z.literal(true),
  supportsSynthesisEffectivenessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EffectivenessCapabilitiesResponse = z.infer<
  typeof effectivenessCapabilitiesResponseSchema
>

export const effectivenessRolloutResponseSchema = z.object({
  status: effectivenessRolloutStatusSchema,
  checks: z.array(effectivenessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EffectivenessRolloutResponse = z.infer<
  typeof effectivenessRolloutResponseSchema
>

export function getEffectivenessRolloutGuidance() {
  return 'Production effectiveness rollout validates agent output effectiveness, synthesis effectiveness signals, artifact coverage, and effect readiness before production effectiveness tooling.'
}
