import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const validityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ValidityRolloutCheckStatus = z.infer<
  typeof validityRolloutCheckStatusSchema
>

export const validityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: validityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ValidityRolloutCheck = z.infer<typeof validityRolloutCheckSchema>

export const validityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ValidityRolloutStatus = z.infer<typeof validityRolloutStatusSchema>

export const validityCapabilitiesResponseSchema = z.object({
  supportsValidityRollout: z.literal(true),
  supportsValidityAdminTools: z.literal(true),
  supportsAgentOutputValiditySignals: z.literal(true),
  supportsArtifactValiditySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ValidityCapabilitiesResponse = z.infer<
  typeof validityCapabilitiesResponseSchema
>

export const validityRolloutResponseSchema = z.object({
  status: validityRolloutStatusSchema,
  checks: z.array(validityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ValidityRolloutResponse = z.infer<
  typeof validityRolloutResponseSchema
>

export function getValidityRolloutGuidance() {
  return 'Production validity rollout validates agent output validity, artifact content validity signals, shield scan coverage, and validation readiness before production validity tooling.'
}
