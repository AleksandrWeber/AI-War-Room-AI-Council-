import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const complianceledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComplianceledgerizabilityRolloutCheckStatus = z.infer<
  typeof complianceledgerizabilityRolloutCheckStatusSchema
>

export const complianceledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: complianceledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComplianceledgerizabilityRolloutCheck = z.infer<typeof complianceledgerizabilityRolloutCheckSchema>

export const complianceledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComplianceledgerizabilityRolloutStatus = z.infer<typeof complianceledgerizabilityRolloutStatusSchema>

export const complianceledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsComplianceledgerizabilityRollout: z.literal(true),
  supportsComplianceledgerizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceComplianceledgerizabilitySignals: z.literal(true),
  supportsBillingRecordComplianceledgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComplianceledgerizabilityCapabilitiesResponse = z.infer<
  typeof complianceledgerizabilityCapabilitiesResponseSchema
>

export const complianceledgerizabilityRolloutResponseSchema = z.object({
  status: complianceledgerizabilityRolloutStatusSchema,
  checks: z.array(complianceledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComplianceledgerizabilityRolloutResponse = z.infer<
  typeof complianceledgerizabilityRolloutResponseSchema
>

export function getComplianceledgerizabilityRolloutGuidance() {
  return 'Production complianceledgerizability rollout validates billing invoice complianceledgerizability, billing record complianceledgerizability signals, billing webhook coverage, and scalingization readiness before production complianceledgerizability tooling.'
}
