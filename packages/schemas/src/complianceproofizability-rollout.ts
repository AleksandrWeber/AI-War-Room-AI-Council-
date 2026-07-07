import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const complianceproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComplianceproofizabilityRolloutCheckStatus = z.infer<
  typeof complianceproofizabilityRolloutCheckStatusSchema
>

export const complianceproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: complianceproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComplianceproofizabilityRolloutCheck = z.infer<typeof complianceproofizabilityRolloutCheckSchema>

export const complianceproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComplianceproofizabilityRolloutStatus = z.infer<typeof complianceproofizabilityRolloutStatusSchema>

export const complianceproofizabilityCapabilitiesResponseSchema = z.object({
  supportsComplianceproofizabilityRollout: z.literal(true),
  supportsComplianceproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationComplianceproofizabilitySignals: z.literal(true),
  supportsBillingWebhookComplianceproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComplianceproofizabilityCapabilitiesResponse = z.infer<
  typeof complianceproofizabilityCapabilitiesResponseSchema
>

export const complianceproofizabilityRolloutResponseSchema = z.object({
  status: complianceproofizabilityRolloutStatusSchema,
  checks: z.array(complianceproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComplianceproofizabilityRolloutResponse = z.infer<
  typeof complianceproofizabilityRolloutResponseSchema
>

export function getComplianceproofizabilityRolloutGuidance() {
  return 'Production complianceproofizability rollout validates billing notification complianceproofizability, billing webhook complianceproofizability signals, usage event coverage, and governanceization readiness before production complianceproofizability tooling.'
}
