import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const attributabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AttributabilityRolloutCheckStatus = z.infer<
  typeof attributabilityRolloutCheckStatusSchema
>

export const attributabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: attributabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AttributabilityRolloutCheck = z.infer<typeof attributabilityRolloutCheckSchema>

export const attributabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AttributabilityRolloutStatus = z.infer<typeof attributabilityRolloutStatusSchema>

export const attributabilityCapabilitiesResponseSchema = z.object({
  supportsAttributabilityRollout: z.literal(true),
  supportsAttributabilityAdminTools: z.literal(true),
  supportsAgentOutputAttributabilitySignals: z.literal(true),
  supportsSynthesisAttributabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AttributabilityCapabilitiesResponse = z.infer<
  typeof attributabilityCapabilitiesResponseSchema
>

export const attributabilityRolloutResponseSchema = z.object({
  status: attributabilityRolloutStatusSchema,
  checks: z.array(attributabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AttributabilityRolloutResponse = z.infer<
  typeof attributabilityRolloutResponseSchema
>

export function getAttributabilityRolloutGuidance() {
  return 'Production attributability rollout validates agent output attributability, synthesis attributability signals, artifact coverage, and attribution readiness before production attributability tooling.'
}
