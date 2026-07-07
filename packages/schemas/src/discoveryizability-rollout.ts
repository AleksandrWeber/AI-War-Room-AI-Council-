import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const discoveryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DiscoveryizabilityRolloutCheckStatus = z.infer<
  typeof discoveryizabilityRolloutCheckStatusSchema
>

export const discoveryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: discoveryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DiscoveryizabilityRolloutCheck = z.infer<typeof discoveryizabilityRolloutCheckSchema>

export const discoveryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DiscoveryizabilityRolloutStatus = z.infer<typeof discoveryizabilityRolloutStatusSchema>

export const discoveryizabilityCapabilitiesResponseSchema = z.object({
  supportsDiscoveryizabilityRollout: z.literal(true),
  supportsDiscoveryizabilityAdminTools: z.literal(true),
  supportsBillingWebhookDiscoveryizabilitySignals: z.literal(true),
  supportsBillingRecordDiscoveryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DiscoveryizabilityCapabilitiesResponse = z.infer<
  typeof discoveryizabilityCapabilitiesResponseSchema
>

export const discoveryizabilityRolloutResponseSchema = z.object({
  status: discoveryizabilityRolloutStatusSchema,
  checks: z.array(discoveryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DiscoveryizabilityRolloutResponse = z.infer<
  typeof discoveryizabilityRolloutResponseSchema
>

export function getDiscoveryizabilityRolloutGuidance() {
  return 'Production discoveryizability rollout validates billing webhook discoveryizability, billing record discoveryizability signals, usage event coverage, and interpolation readiness before production discoveryizability tooling.'
}
