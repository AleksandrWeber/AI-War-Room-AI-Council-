import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const projectizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProjectizabilityRolloutCheckStatus = z.infer<
  typeof projectizabilityRolloutCheckStatusSchema
>

export const projectizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: projectizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProjectizabilityRolloutCheck = z.infer<typeof projectizabilityRolloutCheckSchema>

export const projectizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProjectizabilityRolloutStatus = z.infer<typeof projectizabilityRolloutStatusSchema>

export const projectizabilityCapabilitiesResponseSchema = z.object({
  supportsProjectizabilityRollout: z.literal(true),
  supportsProjectizabilityAdminTools: z.literal(true),
  supportsBillingNotificationProjectizabilitySignals: z.literal(true),
  supportsBillingWebhookProjectizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProjectizabilityCapabilitiesResponse = z.infer<
  typeof projectizabilityCapabilitiesResponseSchema
>

export const projectizabilityRolloutResponseSchema = z.object({
  status: projectizabilityRolloutStatusSchema,
  checks: z.array(projectizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProjectizabilityRolloutResponse = z.infer<
  typeof projectizabilityRolloutResponseSchema
>

export function getProjectizabilityRolloutGuidance() {
  return 'Production projectizability rollout validates billing notification projectizability, billing webhook projectizability signals, usage event coverage, and projectization readiness before production projectizability tooling.'
}
