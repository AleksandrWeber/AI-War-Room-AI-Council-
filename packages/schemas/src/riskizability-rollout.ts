import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const riskizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RiskizabilityRolloutCheckStatus = z.infer<
  typeof riskizabilityRolloutCheckStatusSchema
>

export const riskizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: riskizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RiskizabilityRolloutCheck = z.infer<typeof riskizabilityRolloutCheckSchema>

export const riskizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RiskizabilityRolloutStatus = z.infer<typeof riskizabilityRolloutStatusSchema>

export const riskizabilityCapabilitiesResponseSchema = z.object({
  supportsRiskizabilityRollout: z.literal(true),
  supportsRiskizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRiskizabilitySignals: z.literal(true),
  supportsBillingRecordRiskizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RiskizabilityCapabilitiesResponse = z.infer<
  typeof riskizabilityCapabilitiesResponseSchema
>

export const riskizabilityRolloutResponseSchema = z.object({
  status: riskizabilityRolloutStatusSchema,
  checks: z.array(riskizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RiskizabilityRolloutResponse = z.infer<
  typeof riskizabilityRolloutResponseSchema
>

export function getRiskizabilityRolloutGuidance() {
  return 'Production riskizability rollout validates billing invoice riskizability, billing record riskizability signals, billing webhook coverage, and scalingization readiness before production riskizability tooling.'
}
