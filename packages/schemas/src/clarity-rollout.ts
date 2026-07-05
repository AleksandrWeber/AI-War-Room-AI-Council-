import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const clarityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ClarityRolloutCheckStatus = z.infer<
  typeof clarityRolloutCheckStatusSchema
>

export const clarityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: clarityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ClarityRolloutCheck = z.infer<typeof clarityRolloutCheckSchema>

export const clarityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ClarityRolloutStatus = z.infer<typeof clarityRolloutStatusSchema>

export const clarityCapabilitiesResponseSchema = z.object({
  supportsClarityRollout: z.literal(true),
  supportsClarityAdminTools: z.literal(true),
  supportsSynthesisClaritySignals: z.literal(true),
  supportsAgentOutputClaritySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ClarityCapabilitiesResponse = z.infer<
  typeof clarityCapabilitiesResponseSchema
>

export const clarityRolloutResponseSchema = z.object({
  status: clarityRolloutStatusSchema,
  checks: z.array(clarityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ClarityRolloutResponse = z.infer<
  typeof clarityRolloutResponseSchema
>

export function getClarityRolloutGuidance() {
  return 'Production clarity rollout validates synthesis clarity, agent output clarity signals, artifact coverage, and clarity readiness before production clarity tooling.'
}
