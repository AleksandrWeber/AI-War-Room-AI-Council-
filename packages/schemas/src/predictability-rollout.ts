import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const predictabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PredictabilityRolloutCheckStatus = z.infer<
  typeof predictabilityRolloutCheckStatusSchema
>

export const predictabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: predictabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PredictabilityRolloutCheck = z.infer<typeof predictabilityRolloutCheckSchema>

export const predictabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PredictabilityRolloutStatus = z.infer<typeof predictabilityRolloutStatusSchema>

export const predictabilityCapabilitiesResponseSchema = z.object({
  supportsPredictabilityRollout: z.literal(true),
  supportsPredictabilityAdminTools: z.literal(true),
  supportsSynthesisPredictabilitySignals: z.literal(true),
  supportsAgentOutputPredictabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PredictabilityCapabilitiesResponse = z.infer<
  typeof predictabilityCapabilitiesResponseSchema
>

export const predictabilityRolloutResponseSchema = z.object({
  status: predictabilityRolloutStatusSchema,
  checks: z.array(predictabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PredictabilityRolloutResponse = z.infer<
  typeof predictabilityRolloutResponseSchema
>

export function getPredictabilityRolloutGuidance() {
  return 'Production predictability rollout validates synthesis predictability, agent output predictability signals, billing invoice coverage, and prediction readiness before production predictability tooling.'
}
