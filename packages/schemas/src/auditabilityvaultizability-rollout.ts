import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof auditabilityvaultizabilityRolloutCheckStatusSchema
>

export const auditabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditabilityvaultizabilityRolloutCheck = z.infer<typeof auditabilityvaultizabilityRolloutCheckSchema>

export const auditabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditabilityvaultizabilityRolloutStatus = z.infer<typeof auditabilityvaultizabilityRolloutStatusSchema>

export const auditabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditabilityvaultizabilityRollout: z.literal(true),
  supportsAuditabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipAuditabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventAuditabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof auditabilityvaultizabilityCapabilitiesResponseSchema
>

export const auditabilityvaultizabilityRolloutResponseSchema = z.object({
  status: auditabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(auditabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditabilityvaultizabilityRolloutResponse = z.infer<
  typeof auditabilityvaultizabilityRolloutResponseSchema
>

export function getAuditabilityvaultizabilityRolloutGuidance() {
  return 'Production auditabilityvaultizability rollout validates membership auditabilityvaultizability, usage event auditabilityvaultizability signals, billing notification coverage, and healingization readiness before production auditabilityvaultizability tooling.'
}
