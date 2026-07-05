import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const retrievabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RetrievabilityRolloutCheckStatus = z.infer<
  typeof retrievabilityRolloutCheckStatusSchema
>

export const retrievabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: retrievabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RetrievabilityRolloutCheck = z.infer<typeof retrievabilityRolloutCheckSchema>

export const retrievabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RetrievabilityRolloutStatus = z.infer<typeof retrievabilityRolloutStatusSchema>

export const retrievabilityCapabilitiesResponseSchema = z.object({
  supportsRetrievabilityRollout: z.literal(true),
  supportsRetrievabilityAdminTools: z.literal(true),
  supportsShieldScanRetrievabilitySignals: z.literal(true),
  supportsAgentOutputRetrievabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RetrievabilityCapabilitiesResponse = z.infer<
  typeof retrievabilityCapabilitiesResponseSchema
>

export const retrievabilityRolloutResponseSchema = z.object({
  status: retrievabilityRolloutStatusSchema,
  checks: z.array(retrievabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RetrievabilityRolloutResponse = z.infer<
  typeof retrievabilityRolloutResponseSchema
>

export function getRetrievabilityRolloutGuidance() {
  return 'Production retrievability rollout validates shield scan retrievability, agent output retrievability signals, idempotency coverage, and retrieval readiness before production retrievability tooling.'
}
