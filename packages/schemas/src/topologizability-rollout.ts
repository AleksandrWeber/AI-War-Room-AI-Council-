import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const topologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TopologizabilityRolloutCheckStatus = z.infer<
  typeof topologizabilityRolloutCheckStatusSchema
>

export const topologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: topologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TopologizabilityRolloutCheck = z.infer<typeof topologizabilityRolloutCheckSchema>

export const topologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TopologizabilityRolloutStatus = z.infer<typeof topologizabilityRolloutStatusSchema>

export const topologizabilityCapabilitiesResponseSchema = z.object({
  supportsTopologizabilityRollout: z.literal(true),
  supportsTopologizabilityAdminTools: z.literal(true),
  supportsBillingWebhookTopologizabilitySignals: z.literal(true),
  supportsBillingRecordTopologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TopologizabilityCapabilitiesResponse = z.infer<
  typeof topologizabilityCapabilitiesResponseSchema
>

export const topologizabilityRolloutResponseSchema = z.object({
  status: topologizabilityRolloutStatusSchema,
  checks: z.array(topologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TopologizabilityRolloutResponse = z.infer<
  typeof topologizabilityRolloutResponseSchema
>

export function getTopologizabilityRolloutGuidance() {
  return 'Production topologizability rollout validates billing webhook topologizability, billing record topologizability signals, usage event coverage, and interpolation readiness before production topologizability tooling.'
}
