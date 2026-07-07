import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const complianceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComplianceizabilityRolloutCheckStatus = z.infer<
  typeof complianceizabilityRolloutCheckStatusSchema
>

export const complianceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: complianceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComplianceizabilityRolloutCheck = z.infer<typeof complianceizabilityRolloutCheckSchema>

export const complianceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComplianceizabilityRolloutStatus = z.infer<typeof complianceizabilityRolloutStatusSchema>

export const complianceizabilityCapabilitiesResponseSchema = z.object({
  supportsComplianceizabilityRollout: z.literal(true),
  supportsComplianceizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceComplianceizabilitySignals: z.literal(true),
  supportsBillingRecordComplianceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComplianceizabilityCapabilitiesResponse = z.infer<
  typeof complianceizabilityCapabilitiesResponseSchema
>

export const complianceizabilityRolloutResponseSchema = z.object({
  status: complianceizabilityRolloutStatusSchema,
  checks: z.array(complianceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComplianceizabilityRolloutResponse = z.infer<
  typeof complianceizabilityRolloutResponseSchema
>

export function getComplianceizabilityRolloutGuidance() {
  return 'Production complianceizability rollout validates billing invoice complianceizability, billing record complianceizability signals, billing webhook coverage, and scalingization readiness before production complianceizability tooling.'
}
