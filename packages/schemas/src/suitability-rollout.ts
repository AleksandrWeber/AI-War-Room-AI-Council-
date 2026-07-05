import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const suitabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SuitabilityRolloutCheckStatus = z.infer<
  typeof suitabilityRolloutCheckStatusSchema
>

export const suitabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: suitabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SuitabilityRolloutCheck = z.infer<typeof suitabilityRolloutCheckSchema>

export const suitabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SuitabilityRolloutStatus = z.infer<typeof suitabilityRolloutStatusSchema>

export const suitabilityCapabilitiesResponseSchema = z.object({
  supportsSuitabilityRollout: z.literal(true),
  supportsSuitabilityAdminTools: z.literal(true),
  supportsAgentOutputSuitabilitySignals: z.literal(true),
  supportsArtifactSuitabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SuitabilityCapabilitiesResponse = z.infer<
  typeof suitabilityCapabilitiesResponseSchema
>

export const suitabilityRolloutResponseSchema = z.object({
  status: suitabilityRolloutStatusSchema,
  checks: z.array(suitabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SuitabilityRolloutResponse = z.infer<
  typeof suitabilityRolloutResponseSchema
>

export function getSuitabilityRolloutGuidance() {
  return 'Production suitability rollout validates agent output suitability, artifact suitability signals, synthesis coverage, and suitability readiness before production suitability tooling.'
}
