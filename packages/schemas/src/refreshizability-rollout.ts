import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const refreshizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RefreshizabilityRolloutCheckStatus = z.infer<
  typeof refreshizabilityRolloutCheckStatusSchema
>

export const refreshizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: refreshizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RefreshizabilityRolloutCheck = z.infer<typeof refreshizabilityRolloutCheckSchema>

export const refreshizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RefreshizabilityRolloutStatus = z.infer<typeof refreshizabilityRolloutStatusSchema>

export const refreshizabilityCapabilitiesResponseSchema = z.object({
  supportsRefreshizabilityRollout: z.literal(true),
  supportsRefreshizabilityAdminTools: z.literal(true),
  supportsBillingWebhookRefreshizabilitySignals: z.literal(true),
  supportsBillingRecordRefreshizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RefreshizabilityCapabilitiesResponse = z.infer<
  typeof refreshizabilityCapabilitiesResponseSchema
>

export const refreshizabilityRolloutResponseSchema = z.object({
  status: refreshizabilityRolloutStatusSchema,
  checks: z.array(refreshizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RefreshizabilityRolloutResponse = z.infer<
  typeof refreshizabilityRolloutResponseSchema
>

export function getRefreshizabilityRolloutGuidance() {
  return 'Production refreshizability rollout validates billing webhook refreshizability, billing record refreshizability signals, usage event coverage, and interpolation readiness before production refreshizability tooling.'
}
