import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compliancevaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompliancevaultizabilityRolloutCheckStatus = z.infer<
  typeof compliancevaultizabilityRolloutCheckStatusSchema
>

export const compliancevaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compliancevaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompliancevaultizabilityRolloutCheck = z.infer<typeof compliancevaultizabilityRolloutCheckSchema>

export const compliancevaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompliancevaultizabilityRolloutStatus = z.infer<typeof compliancevaultizabilityRolloutStatusSchema>

export const compliancevaultizabilityCapabilitiesResponseSchema = z.object({
  supportsCompliancevaultizabilityRollout: z.literal(true),
  supportsCompliancevaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationCompliancevaultizabilitySignals: z.literal(true),
  supportsBillingWebhookCompliancevaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompliancevaultizabilityCapabilitiesResponse = z.infer<
  typeof compliancevaultizabilityCapabilitiesResponseSchema
>

export const compliancevaultizabilityRolloutResponseSchema = z.object({
  status: compliancevaultizabilityRolloutStatusSchema,
  checks: z.array(compliancevaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompliancevaultizabilityRolloutResponse = z.infer<
  typeof compliancevaultizabilityRolloutResponseSchema
>

export function getCompliancevaultizabilityRolloutGuidance() {
  return 'Production compliancevaultizability rollout validates billing notification compliancevaultizability, billing webhook compliancevaultizability signals, usage event coverage, and governanceization readiness before production compliancevaultizability tooling.'
}
