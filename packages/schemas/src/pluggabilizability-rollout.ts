import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const pluggabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PluggabilizabilityRolloutCheckStatus = z.infer<
  typeof pluggabilizabilityRolloutCheckStatusSchema
>

export const pluggabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: pluggabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PluggabilizabilityRolloutCheck = z.infer<typeof pluggabilizabilityRolloutCheckSchema>

export const pluggabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PluggabilizabilityRolloutStatus = z.infer<typeof pluggabilizabilityRolloutStatusSchema>

export const pluggabilizabilityCapabilitiesResponseSchema = z.object({
  supportsPluggabilizabilityRollout: z.literal(true),
  supportsPluggabilizabilityAdminTools: z.literal(true),
  supportsBillingNotificationPluggabilizabilitySignals: z.literal(true),
  supportsBillingWebhookPluggabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PluggabilizabilityCapabilitiesResponse = z.infer<
  typeof pluggabilizabilityCapabilitiesResponseSchema
>

export const pluggabilizabilityRolloutResponseSchema = z.object({
  status: pluggabilizabilityRolloutStatusSchema,
  checks: z.array(pluggabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PluggabilizabilityRolloutResponse = z.infer<
  typeof pluggabilizabilityRolloutResponseSchema
>

export function getPluggabilizabilityRolloutGuidance() {
  return 'Production pluggabilizability rollout validates billing notification pluggabilizability, billing webhook pluggabilizability signals, usage event coverage, and pluggabilization readiness before production pluggabilizability tooling.'
}
