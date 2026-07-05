import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const explainabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExplainabilityRolloutCheckStatus = z.infer<
  typeof explainabilityRolloutCheckStatusSchema
>

export const explainabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: explainabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExplainabilityRolloutCheck = z.infer<typeof explainabilityRolloutCheckSchema>

export const explainabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExplainabilityRolloutStatus = z.infer<typeof explainabilityRolloutStatusSchema>

export const explainabilityCapabilitiesResponseSchema = z.object({
  supportsExplainabilityRollout: z.literal(true),
  supportsExplainabilityAdminTools: z.literal(true),
  supportsSynthesisExplainabilitySignals: z.literal(true),
  supportsAgentOutputExplainabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExplainabilityCapabilitiesResponse = z.infer<
  typeof explainabilityCapabilitiesResponseSchema
>

export const explainabilityRolloutResponseSchema = z.object({
  status: explainabilityRolloutStatusSchema,
  checks: z.array(explainabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExplainabilityRolloutResponse = z.infer<
  typeof explainabilityRolloutResponseSchema
>

export function getExplainabilityRolloutGuidance() {
  return 'Production explainability rollout validates synthesis explainability, agent output explainability signals, artifact coverage, and interpretation readiness before production explainability tooling.'
}
