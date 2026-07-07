import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const segregationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SegregationizabilityRolloutCheckStatus = z.infer<
  typeof segregationizabilityRolloutCheckStatusSchema
>

export const segregationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: segregationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SegregationizabilityRolloutCheck = z.infer<typeof segregationizabilityRolloutCheckSchema>

export const segregationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SegregationizabilityRolloutStatus = z.infer<typeof segregationizabilityRolloutStatusSchema>

export const segregationizabilityCapabilitiesResponseSchema = z.object({
  supportsSegregationizabilityRollout: z.literal(true),
  supportsSegregationizabilityAdminTools: z.literal(true),
  supportsBillingNotificationSegregationizabilitySignals: z.literal(true),
  supportsBillingWebhookSegregationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SegregationizabilityCapabilitiesResponse = z.infer<
  typeof segregationizabilityCapabilitiesResponseSchema
>

export const segregationizabilityRolloutResponseSchema = z.object({
  status: segregationizabilityRolloutStatusSchema,
  checks: z.array(segregationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SegregationizabilityRolloutResponse = z.infer<
  typeof segregationizabilityRolloutResponseSchema
>

export function getSegregationizabilityRolloutGuidance() {
  return 'Production segregationizability rollout validates billing notification segregationizability, billing webhook segregationizability signals, usage event coverage, and governanceization readiness before production segregationizability tooling.'
}
