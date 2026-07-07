import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditingizabilityRolloutCheckStatus = z.infer<
  typeof auditingizabilityRolloutCheckStatusSchema
>

export const auditingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditingizabilityRolloutCheck = z.infer<typeof auditingizabilityRolloutCheckSchema>

export const auditingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditingizabilityRolloutStatus = z.infer<typeof auditingizabilityRolloutStatusSchema>

export const auditingizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditingizabilityRollout: z.literal(true),
  supportsAuditingizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAuditingizabilitySignals: z.literal(true),
  supportsBillingRecordAuditingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditingizabilityCapabilitiesResponse = z.infer<
  typeof auditingizabilityCapabilitiesResponseSchema
>

export const auditingizabilityRolloutResponseSchema = z.object({
  status: auditingizabilityRolloutStatusSchema,
  checks: z.array(auditingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditingizabilityRolloutResponse = z.infer<
  typeof auditingizabilityRolloutResponseSchema
>

export function getAuditingizabilityRolloutGuidance() {
  return 'Production auditingizability rollout validates billing invoice auditingizability, billing record auditingizability signals, billing webhook coverage, and scalingization readiness before production auditingizability tooling.'
}
