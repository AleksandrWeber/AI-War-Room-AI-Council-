import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const extrapolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExtrapolizabilityRolloutCheckStatus = z.infer<
  typeof extrapolizabilityRolloutCheckStatusSchema
>

export const extrapolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: extrapolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExtrapolizabilityRolloutCheck = z.infer<typeof extrapolizabilityRolloutCheckSchema>

export const extrapolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExtrapolizabilityRolloutStatus = z.infer<typeof extrapolizabilityRolloutStatusSchema>

export const extrapolizabilityCapabilitiesResponseSchema = z.object({
  supportsExtrapolizabilityRollout: z.literal(true),
  supportsExtrapolizabilityAdminTools: z.literal(true),
  supportsModelHealthExtrapolizabilitySignals: z.literal(true),
  supportsModelRegistryExtrapolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExtrapolizabilityCapabilitiesResponse = z.infer<
  typeof extrapolizabilityCapabilitiesResponseSchema
>

export const extrapolizabilityRolloutResponseSchema = z.object({
  status: extrapolizabilityRolloutStatusSchema,
  checks: z.array(extrapolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExtrapolizabilityRolloutResponse = z.infer<
  typeof extrapolizabilityRolloutResponseSchema
>

export function getExtrapolizabilityRolloutGuidance() {
  return 'Production extrapolizability rollout validates model health extrapolizability, model registry extrapolizability signals, billing record coverage, and extrapolization readiness before production extrapolizability tooling.'
}
