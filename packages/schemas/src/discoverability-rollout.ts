import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const discoverabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DiscoverabilityRolloutCheckStatus = z.infer<
  typeof discoverabilityRolloutCheckStatusSchema
>

export const discoverabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: discoverabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DiscoverabilityRolloutCheck = z.infer<typeof discoverabilityRolloutCheckSchema>

export const discoverabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DiscoverabilityRolloutStatus = z.infer<typeof discoverabilityRolloutStatusSchema>

export const discoverabilityCapabilitiesResponseSchema = z.object({
  supportsDiscoverabilityRollout: z.literal(true),
  supportsDiscoverabilityAdminTools: z.literal(true),
  supportsMeterUsageDiscoverabilitySignals: z.literal(true),
  supportsBillingNotificationDiscoverabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DiscoverabilityCapabilitiesResponse = z.infer<
  typeof discoverabilityCapabilitiesResponseSchema
>

export const discoverabilityRolloutResponseSchema = z.object({
  status: discoverabilityRolloutStatusSchema,
  checks: z.array(discoverabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DiscoverabilityRolloutResponse = z.infer<
  typeof discoverabilityRolloutResponseSchema
>

export function getDiscoverabilityRolloutGuidance() {
  return 'Production discoverability rollout validates meter usage discoverability, billing notification discoverability signals, billing webhook coverage, and discovery readiness before production discoverability tooling.'
}
