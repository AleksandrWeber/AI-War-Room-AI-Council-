import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assessabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssessabilityRolloutCheckStatus = z.infer<
  typeof assessabilityRolloutCheckStatusSchema
>

export const assessabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assessabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssessabilityRolloutCheck = z.infer<typeof assessabilityRolloutCheckSchema>

export const assessabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssessabilityRolloutStatus = z.infer<typeof assessabilityRolloutStatusSchema>

export const assessabilityCapabilitiesResponseSchema = z.object({
  supportsAssessabilityRollout: z.literal(true),
  supportsAssessabilityAdminTools: z.literal(true),
  supportsModelHealthAssessabilitySignals: z.literal(true),
  supportsModelRegistryAssessabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssessabilityCapabilitiesResponse = z.infer<
  typeof assessabilityCapabilitiesResponseSchema
>

export const assessabilityRolloutResponseSchema = z.object({
  status: assessabilityRolloutStatusSchema,
  checks: z.array(assessabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssessabilityRolloutResponse = z.infer<
  typeof assessabilityRolloutResponseSchema
>

export function getAssessabilityRolloutGuidance() {
  return 'Production assessability rollout validates model health assessability, model registry assessability signals, billing record coverage, and evaluation readiness before production assessability tooling.'
}
