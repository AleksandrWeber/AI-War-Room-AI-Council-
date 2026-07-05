import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const protocolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProtocolizabilityRolloutCheckStatus = z.infer<
  typeof protocolizabilityRolloutCheckStatusSchema
>

export const protocolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: protocolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProtocolizabilityRolloutCheck = z.infer<typeof protocolizabilityRolloutCheckSchema>

export const protocolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProtocolizabilityRolloutStatus = z.infer<typeof protocolizabilityRolloutStatusSchema>

export const protocolizabilityCapabilitiesResponseSchema = z.object({
  supportsProtocolizabilityRollout: z.literal(true),
  supportsProtocolizabilityAdminTools: z.literal(true),
  supportsModelHealthProtocolizabilitySignals: z.literal(true),
  supportsModelRegistryProtocolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProtocolizabilityCapabilitiesResponse = z.infer<
  typeof protocolizabilityCapabilitiesResponseSchema
>

export const protocolizabilityRolloutResponseSchema = z.object({
  status: protocolizabilityRolloutStatusSchema,
  checks: z.array(protocolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProtocolizabilityRolloutResponse = z.infer<
  typeof protocolizabilityRolloutResponseSchema
>

export function getProtocolizabilityRolloutGuidance() {
  return 'Production protocolizability rollout validates model health protocolizability, model registry protocolizability signals, billing record coverage, and optimization readiness before production protocolizability tooling.'
}
