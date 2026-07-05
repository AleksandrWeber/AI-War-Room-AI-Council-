import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const predictizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PredictizabilityRolloutCheckStatus = z.infer<
  typeof predictizabilityRolloutCheckStatusSchema
>

export const predictizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: predictizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PredictizabilityRolloutCheck = z.infer<typeof predictizabilityRolloutCheckSchema>

export const predictizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PredictizabilityRolloutStatus = z.infer<typeof predictizabilityRolloutStatusSchema>

export const predictizabilityCapabilitiesResponseSchema = z.object({
  supportsPredictizabilityRollout: z.literal(true),
  supportsPredictizabilityAdminTools: z.literal(true),
  supportsProviderCredentialPredictizabilitySignals: z.literal(true),
  supportsModelRegistryPredictizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PredictizabilityCapabilitiesResponse = z.infer<
  typeof predictizabilityCapabilitiesResponseSchema
>

export const predictizabilityRolloutResponseSchema = z.object({
  status: predictizabilityRolloutStatusSchema,
  checks: z.array(predictizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PredictizabilityRolloutResponse = z.infer<
  typeof predictizabilityRolloutResponseSchema
>

export function getPredictizabilityRolloutGuidance() {
  return 'Production predictizability rollout validates provider credential predictizability, model registry predictizability signals, billing webhook coverage, and predictization readiness before production predictizability tooling.'
}
