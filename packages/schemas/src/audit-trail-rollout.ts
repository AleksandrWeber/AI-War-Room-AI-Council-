import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditTrailRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditTrailRolloutCheckStatus = z.infer<
  typeof auditTrailRolloutCheckStatusSchema
>

export const auditTrailRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditTrailRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditTrailRolloutCheck = z.infer<
  typeof auditTrailRolloutCheckSchema
>

export const auditTrailRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditTrailRolloutStatus = z.infer<
  typeof auditTrailRolloutStatusSchema
>

export const auditTrailCapabilitiesResponseSchema = z.object({
  supportsAuditTrailRollout: z.literal(true),
  supportsAuditTrailAdminTools: z.literal(true),
  supportsWorkspaceAuditExport: z.literal(true),
  supportsPersistentAuditTables: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditTrailCapabilitiesResponse = z.infer<
  typeof auditTrailCapabilitiesResponseSchema
>

export const auditTrailRolloutResponseSchema = z.object({
  status: auditTrailRolloutStatusSchema,
  checks: z.array(auditTrailRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditTrailRolloutResponse = z.infer<
  typeof auditTrailRolloutResponseSchema
>

export function getAuditTrailRolloutGuidance() {
  return 'Production audit trail rollout validates persistent audit table coverage, workspace audit export support, and retention readiness before production audit tooling.'
}
