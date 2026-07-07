import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const predictabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PredictabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof predictabilityvaultizabilityRolloutCheckStatusSchema
>

export const predictabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: predictabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PredictabilityvaultizabilityRolloutCheck = z.infer<typeof predictabilityvaultizabilityRolloutCheckSchema>

export const predictabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PredictabilityvaultizabilityRolloutStatus = z.infer<typeof predictabilityvaultizabilityRolloutStatusSchema>

export const predictabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsPredictabilityvaultizabilityRollout: z.literal(true),
  supportsPredictabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationPredictabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookPredictabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PredictabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof predictabilityvaultizabilityCapabilitiesResponseSchema
>

export const predictabilityvaultizabilityRolloutResponseSchema = z.object({
  status: predictabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(predictabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PredictabilityvaultizabilityRolloutResponse = z.infer<
  typeof predictabilityvaultizabilityRolloutResponseSchema
>

export function getPredictabilityvaultizabilityRolloutGuidance() {
  return 'Production predictabilityvaultizability rollout validates billing notification predictabilityvaultizability, billing webhook predictabilityvaultizability signals, usage event coverage, and governanceization readiness before production predictabilityvaultizability tooling.'
}
