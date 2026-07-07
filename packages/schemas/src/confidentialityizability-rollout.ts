import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const confidentialityizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConfidentialityizabilityRolloutCheckStatus = z.infer<
  typeof confidentialityizabilityRolloutCheckStatusSchema
>

export const confidentialityizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: confidentialityizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConfidentialityizabilityRolloutCheck = z.infer<typeof confidentialityizabilityRolloutCheckSchema>

export const confidentialityizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConfidentialityizabilityRolloutStatus = z.infer<typeof confidentialityizabilityRolloutStatusSchema>

export const confidentialityizabilityCapabilitiesResponseSchema = z.object({
  supportsConfidentialityizabilityRollout: z.literal(true),
  supportsConfidentialityizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceConfidentialityizabilitySignals: z.literal(true),
  supportsBillingRecordConfidentialityizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConfidentialityizabilityCapabilitiesResponse = z.infer<
  typeof confidentialityizabilityCapabilitiesResponseSchema
>

export const confidentialityizabilityRolloutResponseSchema = z.object({
  status: confidentialityizabilityRolloutStatusSchema,
  checks: z.array(confidentialityizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConfidentialityizabilityRolloutResponse = z.infer<
  typeof confidentialityizabilityRolloutResponseSchema
>

export function getConfidentialityizabilityRolloutGuidance() {
  return 'Production confidentialityizability rollout validates billing invoice confidentialityizability, billing record confidentialityizability signals, billing webhook coverage, and scalingization readiness before production confidentialityizability tooling.'
}
