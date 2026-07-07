import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const audittrailizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AudittrailizabilityRolloutCheckStatus = z.infer<
  typeof audittrailizabilityRolloutCheckStatusSchema
>

export const audittrailizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: audittrailizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AudittrailizabilityRolloutCheck = z.infer<typeof audittrailizabilityRolloutCheckSchema>

export const audittrailizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AudittrailizabilityRolloutStatus = z.infer<typeof audittrailizabilityRolloutStatusSchema>

export const audittrailizabilityCapabilitiesResponseSchema = z.object({
  supportsAudittrailizabilityRollout: z.literal(true),
  supportsAudittrailizabilityAdminTools: z.literal(true),
  supportsShieldScanAudittrailizabilitySignals: z.literal(true),
  supportsProviderCredentialAudittrailizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AudittrailizabilityCapabilitiesResponse = z.infer<
  typeof audittrailizabilityCapabilitiesResponseSchema
>

export const audittrailizabilityRolloutResponseSchema = z.object({
  status: audittrailizabilityRolloutStatusSchema,
  checks: z.array(audittrailizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AudittrailizabilityRolloutResponse = z.infer<
  typeof audittrailizabilityRolloutResponseSchema
>

export function getAudittrailizabilityRolloutGuidance() {
  return 'Production audittrailizability rollout validates shield scan audittrailizability, provider credential audittrailizability signals, billing webhook coverage, and reconciliationization readiness before production audittrailizability tooling.'
}
