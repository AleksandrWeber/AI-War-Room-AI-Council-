import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const chainingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ChainingizabilityRolloutCheckStatus = z.infer<
  typeof chainingizabilityRolloutCheckStatusSchema
>

export const chainingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: chainingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ChainingizabilityRolloutCheck = z.infer<typeof chainingizabilityRolloutCheckSchema>

export const chainingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ChainingizabilityRolloutStatus = z.infer<typeof chainingizabilityRolloutStatusSchema>

export const chainingizabilityCapabilitiesResponseSchema = z.object({
  supportsChainingizabilityRollout: z.literal(true),
  supportsChainingizabilityAdminTools: z.literal(true),
  supportsShieldScanChainingizabilitySignals: z.literal(true),
  supportsProviderCredentialChainingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ChainingizabilityCapabilitiesResponse = z.infer<
  typeof chainingizabilityCapabilitiesResponseSchema
>

export const chainingizabilityRolloutResponseSchema = z.object({
  status: chainingizabilityRolloutStatusSchema,
  checks: z.array(chainingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ChainingizabilityRolloutResponse = z.infer<
  typeof chainingizabilityRolloutResponseSchema
>

export function getChainingizabilityRolloutGuidance() {
  return 'Production chainingizability rollout validates shield scan chainingizability, provider credential chainingizability signals, billing webhook coverage, and chainingization readiness before production chainingizability tooling.'
}
