import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compliancejournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompliancejournalizabilityRolloutCheckStatus = z.infer<
  typeof compliancejournalizabilityRolloutCheckStatusSchema
>

export const compliancejournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compliancejournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompliancejournalizabilityRolloutCheck = z.infer<typeof compliancejournalizabilityRolloutCheckSchema>

export const compliancejournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompliancejournalizabilityRolloutStatus = z.infer<typeof compliancejournalizabilityRolloutStatusSchema>

export const compliancejournalizabilityCapabilitiesResponseSchema = z.object({
  supportsCompliancejournalizabilityRollout: z.literal(true),
  supportsCompliancejournalizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCompliancejournalizabilitySignals: z.literal(true),
  supportsBillingRecordCompliancejournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompliancejournalizabilityCapabilitiesResponse = z.infer<
  typeof compliancejournalizabilityCapabilitiesResponseSchema
>

export const compliancejournalizabilityRolloutResponseSchema = z.object({
  status: compliancejournalizabilityRolloutStatusSchema,
  checks: z.array(compliancejournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompliancejournalizabilityRolloutResponse = z.infer<
  typeof compliancejournalizabilityRolloutResponseSchema
>

export function getCompliancejournalizabilityRolloutGuidance() {
  return 'Production compliancejournalizability rollout validates billing invoice compliancejournalizability, billing record compliancejournalizability signals, billing webhook coverage, and scalingization readiness before production compliancejournalizability tooling.'
}
