import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const relayizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RelayizabilityRolloutCheckStatus = z.infer<
  typeof relayizabilityRolloutCheckStatusSchema
>

export const relayizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: relayizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RelayizabilityRolloutCheck = z.infer<typeof relayizabilityRolloutCheckSchema>

export const relayizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RelayizabilityRolloutStatus = z.infer<typeof relayizabilityRolloutStatusSchema>

export const relayizabilityCapabilitiesResponseSchema = z.object({
  supportsRelayizabilityRollout: z.literal(true),
  supportsRelayizabilityAdminTools: z.literal(true),
  supportsModelHealthRelayizabilitySignals: z.literal(true),
  supportsModelRegistryRelayizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RelayizabilityCapabilitiesResponse = z.infer<
  typeof relayizabilityCapabilitiesResponseSchema
>

export const relayizabilityRolloutResponseSchema = z.object({
  status: relayizabilityRolloutStatusSchema,
  checks: z.array(relayizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RelayizabilityRolloutResponse = z.infer<
  typeof relayizabilityRolloutResponseSchema
>

export function getRelayizabilityRolloutGuidance() {
  return 'Production relayizability rollout validates model health relayizability, model registry relayizability signals, billing record coverage, and optimization readiness before production relayizability tooling.'
}
