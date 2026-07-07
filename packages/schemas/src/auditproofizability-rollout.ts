import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditproofizabilityRolloutCheckStatus = z.infer<
  typeof auditproofizabilityRolloutCheckStatusSchema
>

export const auditproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditproofizabilityRolloutCheck = z.infer<typeof auditproofizabilityRolloutCheckSchema>

export const auditproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditproofizabilityRolloutStatus = z.infer<typeof auditproofizabilityRolloutStatusSchema>

export const auditproofizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditproofizabilityRollout: z.literal(true),
  supportsAuditproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAuditproofizabilitySignals: z.literal(true),
  supportsBillingWebhookAuditproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditproofizabilityCapabilitiesResponse = z.infer<
  typeof auditproofizabilityCapabilitiesResponseSchema
>

export const auditproofizabilityRolloutResponseSchema = z.object({
  status: auditproofizabilityRolloutStatusSchema,
  checks: z.array(auditproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditproofizabilityRolloutResponse = z.infer<
  typeof auditproofizabilityRolloutResponseSchema
>

export function getAuditproofizabilityRolloutGuidance() {
  return 'Production auditproofizability rollout validates billing notification auditproofizability, billing webhook auditproofizability signals, usage event coverage, and governanceization readiness before production auditproofizability tooling.'
}
