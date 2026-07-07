import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditregistryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditregistryizabilityRolloutCheckStatus = z.infer<
  typeof auditregistryizabilityRolloutCheckStatusSchema
>

export const auditregistryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditregistryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditregistryizabilityRolloutCheck = z.infer<typeof auditregistryizabilityRolloutCheckSchema>

export const auditregistryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditregistryizabilityRolloutStatus = z.infer<typeof auditregistryizabilityRolloutStatusSchema>

export const auditregistryizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditregistryizabilityRollout: z.literal(true),
  supportsAuditregistryizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAuditregistryizabilitySignals: z.literal(true),
  supportsBillingWebhookAuditregistryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditregistryizabilityCapabilitiesResponse = z.infer<
  typeof auditregistryizabilityCapabilitiesResponseSchema
>

export const auditregistryizabilityRolloutResponseSchema = z.object({
  status: auditregistryizabilityRolloutStatusSchema,
  checks: z.array(auditregistryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditregistryizabilityRolloutResponse = z.infer<
  typeof auditregistryizabilityRolloutResponseSchema
>

export function getAuditregistryizabilityRolloutGuidance() {
  return 'Production auditregistryizability rollout validates billing notification auditregistryizability, billing webhook auditregistryizability signals, usage event coverage, and governanceization readiness before production auditregistryizability tooling.'
}
