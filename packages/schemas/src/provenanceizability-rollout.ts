import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const provenanceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProvenanceizabilityRolloutCheckStatus = z.infer<
  typeof provenanceizabilityRolloutCheckStatusSchema
>

export const provenanceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: provenanceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProvenanceizabilityRolloutCheck = z.infer<typeof provenanceizabilityRolloutCheckSchema>

export const provenanceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProvenanceizabilityRolloutStatus = z.infer<typeof provenanceizabilityRolloutStatusSchema>

export const provenanceizabilityCapabilitiesResponseSchema = z.object({
  supportsProvenanceizabilityRollout: z.literal(true),
  supportsProvenanceizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceProvenanceizabilitySignals: z.literal(true),
  supportsBillingRecordProvenanceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProvenanceizabilityCapabilitiesResponse = z.infer<
  typeof provenanceizabilityCapabilitiesResponseSchema
>

export const provenanceizabilityRolloutResponseSchema = z.object({
  status: provenanceizabilityRolloutStatusSchema,
  checks: z.array(provenanceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProvenanceizabilityRolloutResponse = z.infer<
  typeof provenanceizabilityRolloutResponseSchema
>

export function getProvenanceizabilityRolloutGuidance() {
  return 'Production provenanceizability rollout validates billing invoice provenanceizability, billing record provenanceizability signals, billing webhook coverage, and scalingization readiness before production provenanceizability tooling.'
}
