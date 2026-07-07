import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const complianceguardizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComplianceguardizabilityRolloutCheckStatus = z.infer<
  typeof complianceguardizabilityRolloutCheckStatusSchema
>

export const complianceguardizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: complianceguardizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComplianceguardizabilityRolloutCheck = z.infer<typeof complianceguardizabilityRolloutCheckSchema>

export const complianceguardizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComplianceguardizabilityRolloutStatus = z.infer<typeof complianceguardizabilityRolloutStatusSchema>

export const complianceguardizabilityCapabilitiesResponseSchema = z.object({
  supportsComplianceguardizabilityRollout: z.literal(true),
  supportsComplianceguardizabilityAdminTools: z.literal(true),
  supportsBillingNotificationComplianceguardizabilitySignals: z.literal(true),
  supportsBillingWebhookComplianceguardizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComplianceguardizabilityCapabilitiesResponse = z.infer<
  typeof complianceguardizabilityCapabilitiesResponseSchema
>

export const complianceguardizabilityRolloutResponseSchema = z.object({
  status: complianceguardizabilityRolloutStatusSchema,
  checks: z.array(complianceguardizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComplianceguardizabilityRolloutResponse = z.infer<
  typeof complianceguardizabilityRolloutResponseSchema
>

export function getComplianceguardizabilityRolloutGuidance() {
  return 'Production complianceguardizability rollout validates billing notification complianceguardizability, billing webhook complianceguardizability signals, usage event coverage, and governanceization readiness before production complianceguardizability tooling.'
}
