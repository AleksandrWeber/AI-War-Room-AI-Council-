import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const interpretabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InterpretabilityRolloutCheckStatus = z.infer<
  typeof interpretabilityRolloutCheckStatusSchema
>

export const interpretabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: interpretabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InterpretabilityRolloutCheck = z.infer<typeof interpretabilityRolloutCheckSchema>

export const interpretabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InterpretabilityRolloutStatus = z.infer<typeof interpretabilityRolloutStatusSchema>

export const interpretabilityCapabilitiesResponseSchema = z.object({
  supportsInterpretabilityRollout: z.literal(true),
  supportsInterpretabilityAdminTools: z.literal(true),
  supportsAgentOutputInterpretabilitySignals: z.literal(true),
  supportsSynthesisInterpretabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InterpretabilityCapabilitiesResponse = z.infer<
  typeof interpretabilityCapabilitiesResponseSchema
>

export const interpretabilityRolloutResponseSchema = z.object({
  status: interpretabilityRolloutStatusSchema,
  checks: z.array(interpretabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InterpretabilityRolloutResponse = z.infer<
  typeof interpretabilityRolloutResponseSchema
>

export function getInterpretabilityRolloutGuidance() {
  return 'Production interpretability rollout validates agent output interpretability, synthesis interpretability signals, artifact coverage, and interpretability readiness before production interpretability tooling.'
}
