import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditlineizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditlineizabilityRolloutCheckStatus = z.infer<
  typeof auditlineizabilityRolloutCheckStatusSchema
>

export const auditlineizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditlineizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditlineizabilityRolloutCheck = z.infer<typeof auditlineizabilityRolloutCheckSchema>

export const auditlineizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditlineizabilityRolloutStatus = z.infer<typeof auditlineizabilityRolloutStatusSchema>

export const auditlineizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditlineizabilityRollout: z.literal(true),
  supportsAuditlineizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAuditlineizabilitySignals: z.literal(true),
  supportsBillingRecordAuditlineizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditlineizabilityCapabilitiesResponse = z.infer<
  typeof auditlineizabilityCapabilitiesResponseSchema
>

export const auditlineizabilityRolloutResponseSchema = z.object({
  status: auditlineizabilityRolloutStatusSchema,
  checks: z.array(auditlineizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditlineizabilityRolloutResponse = z.infer<
  typeof auditlineizabilityRolloutResponseSchema
>

export function getAuditlineizabilityRolloutGuidance() {
  return 'Production auditlineizability rollout validates billing invoice auditlineizability, billing record auditlineizability signals, billing webhook coverage, and scalingization readiness before production auditlineizability tooling.'
}
