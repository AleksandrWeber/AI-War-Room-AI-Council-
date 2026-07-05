import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const normalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NormalizabilityRolloutCheckStatus = z.infer<
  typeof normalizabilityRolloutCheckStatusSchema
>

export const normalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: normalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NormalizabilityRolloutCheck = z.infer<typeof normalizabilityRolloutCheckSchema>

export const normalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NormalizabilityRolloutStatus = z.infer<typeof normalizabilityRolloutStatusSchema>

export const normalizabilityCapabilitiesResponseSchema = z.object({
  supportsNormalizabilityRollout: z.literal(true),
  supportsNormalizabilityAdminTools: z.literal(true),
  supportsModelHealthNormalizabilitySignals: z.literal(true),
  supportsModelRegistryNormalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NormalizabilityCapabilitiesResponse = z.infer<
  typeof normalizabilityCapabilitiesResponseSchema
>

export const normalizabilityRolloutResponseSchema = z.object({
  status: normalizabilityRolloutStatusSchema,
  checks: z.array(normalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NormalizabilityRolloutResponse = z.infer<
  typeof normalizabilityRolloutResponseSchema
>

export function getNormalizabilityRolloutGuidance() {
  return 'Production normalizability rollout validates model health normalizability, model registry normalizability signals, billing record coverage, and normalization readiness before production normalizability tooling.'
}
