import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evocatabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvocatabilityRolloutCheckStatus = z.infer<
  typeof evocatabilityRolloutCheckStatusSchema
>

export const evocatabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evocatabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvocatabilityRolloutCheck = z.infer<typeof evocatabilityRolloutCheckSchema>

export const evocatabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvocatabilityRolloutStatus = z.infer<typeof evocatabilityRolloutStatusSchema>

export const evocatabilityCapabilitiesResponseSchema = z.object({
  supportsEvocatabilityRollout: z.literal(true),
  supportsEvocatabilityAdminTools: z.literal(true),
  supportsModelHealthEvocatabilitySignals: z.literal(true),
  supportsModelRegistryEvocatabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvocatabilityCapabilitiesResponse = z.infer<
  typeof evocatabilityCapabilitiesResponseSchema
>

export const evocatabilityRolloutResponseSchema = z.object({
  status: evocatabilityRolloutStatusSchema,
  checks: z.array(evocatabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvocatabilityRolloutResponse = z.infer<
  typeof evocatabilityRolloutResponseSchema
>

export function getEvocatabilityRolloutGuidance() {
  return 'Production evocatability rollout validates model health evocatability, model registry evocatability signals, billing record coverage, and evocation readiness before production evocatability tooling.'
}
