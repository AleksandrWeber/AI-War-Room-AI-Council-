import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const understandabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type UnderstandabilityRolloutCheckStatus = z.infer<
  typeof understandabilityRolloutCheckStatusSchema
>

export const understandabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: understandabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UnderstandabilityRolloutCheck = z.infer<typeof understandabilityRolloutCheckSchema>

export const understandabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UnderstandabilityRolloutStatus = z.infer<typeof understandabilityRolloutStatusSchema>

export const understandabilityCapabilitiesResponseSchema = z.object({
  supportsUnderstandabilityRollout: z.literal(true),
  supportsUnderstandabilityAdminTools: z.literal(true),
  supportsSynthesisUnderstandabilitySignals: z.literal(true),
  supportsAgentOutputUnderstandabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type UnderstandabilityCapabilitiesResponse = z.infer<
  typeof understandabilityCapabilitiesResponseSchema
>

export const understandabilityRolloutResponseSchema = z.object({
  status: understandabilityRolloutStatusSchema,
  checks: z.array(understandabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UnderstandabilityRolloutResponse = z.infer<
  typeof understandabilityRolloutResponseSchema
>

export function getUnderstandabilityRolloutGuidance() {
  return 'Production understandability rollout validates synthesis understandability, agent output understandability signals, artifact coverage, and understanding readiness before production understandability tooling.'
}
