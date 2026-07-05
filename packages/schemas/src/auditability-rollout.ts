import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditabilityRolloutCheckStatus = z.infer<
  typeof auditabilityRolloutCheckStatusSchema
>

export const auditabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditabilityRolloutCheck = z.infer<typeof auditabilityRolloutCheckSchema>

export const auditabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditabilityRolloutStatus = z.infer<typeof auditabilityRolloutStatusSchema>

export const auditabilityCapabilitiesResponseSchema = z.object({
  supportsAuditabilityRollout: z.literal(true),
  supportsAuditabilityAdminTools: z.literal(true),
  supportsUsageAuditabilitySignals: z.literal(true),
  supportsBillingWebhookAuditabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditabilityCapabilitiesResponse = z.infer<
  typeof auditabilityCapabilitiesResponseSchema
>

export const auditabilityRolloutResponseSchema = z.object({
  status: auditabilityRolloutStatusSchema,
  checks: z.array(auditabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditabilityRolloutResponse = z.infer<
  typeof auditabilityRolloutResponseSchema
>

export function getAuditabilityRolloutGuidance() {
  return 'Production auditability rollout validates usage auditability, billing webhook auditability signals, billing notification coverage, and examination readiness before production auditability tooling.'
}
