import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compliancechainizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompliancechainizabilityRolloutCheckStatus = z.infer<
  typeof compliancechainizabilityRolloutCheckStatusSchema
>

export const compliancechainizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compliancechainizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompliancechainizabilityRolloutCheck = z.infer<typeof compliancechainizabilityRolloutCheckSchema>

export const compliancechainizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompliancechainizabilityRolloutStatus = z.infer<typeof compliancechainizabilityRolloutStatusSchema>

export const compliancechainizabilityCapabilitiesResponseSchema = z.object({
  supportsCompliancechainizabilityRollout: z.literal(true),
  supportsCompliancechainizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCompliancechainizabilitySignals: z.literal(true),
  supportsBillingRecordCompliancechainizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompliancechainizabilityCapabilitiesResponse = z.infer<
  typeof compliancechainizabilityCapabilitiesResponseSchema
>

export const compliancechainizabilityRolloutResponseSchema = z.object({
  status: compliancechainizabilityRolloutStatusSchema,
  checks: z.array(compliancechainizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompliancechainizabilityRolloutResponse = z.infer<
  typeof compliancechainizabilityRolloutResponseSchema
>

export function getCompliancechainizabilityRolloutGuidance() {
  return 'Production compliancechainizability rollout validates billing invoice compliancechainizability, billing record compliancechainizability signals, billing webhook coverage, and scalingization readiness before production compliancechainizability tooling.'
}
