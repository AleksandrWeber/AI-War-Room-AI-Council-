import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditjournalizabilityRolloutCheckStatus = z.infer<
  typeof auditjournalizabilityRolloutCheckStatusSchema
>

export const auditjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditjournalizabilityRolloutCheck = z.infer<typeof auditjournalizabilityRolloutCheckSchema>

export const auditjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditjournalizabilityRolloutStatus = z.infer<typeof auditjournalizabilityRolloutStatusSchema>

export const auditjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditjournalizabilityRollout: z.literal(true),
  supportsAuditjournalizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAuditjournalizabilitySignals: z.literal(true),
  supportsBillingWebhookAuditjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditjournalizabilityCapabilitiesResponse = z.infer<
  typeof auditjournalizabilityCapabilitiesResponseSchema
>

export const auditjournalizabilityRolloutResponseSchema = z.object({
  status: auditjournalizabilityRolloutStatusSchema,
  checks: z.array(auditjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditjournalizabilityRolloutResponse = z.infer<
  typeof auditjournalizabilityRolloutResponseSchema
>

export function getAuditjournalizabilityRolloutGuidance() {
  return 'Production auditjournalizability rollout validates billing notification auditjournalizability, billing webhook auditjournalizability signals, usage event coverage, and governanceization readiness before production auditjournalizability tooling.'
}
