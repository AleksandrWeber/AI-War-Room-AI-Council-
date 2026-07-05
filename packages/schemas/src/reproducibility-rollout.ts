import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reproducibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReproducibilityRolloutCheckStatus = z.infer<
  typeof reproducibilityRolloutCheckStatusSchema
>

export const reproducibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reproducibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReproducibilityRolloutCheck = z.infer<typeof reproducibilityRolloutCheckSchema>

export const reproducibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReproducibilityRolloutStatus = z.infer<typeof reproducibilityRolloutStatusSchema>

export const reproducibilityCapabilitiesResponseSchema = z.object({
  supportsReproducibilityRollout: z.literal(true),
  supportsReproducibilityAdminTools: z.literal(true),
  supportsIdempotencyReproducibilitySignals: z.literal(true),
  supportsWorkflowReproducibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReproducibilityCapabilitiesResponse = z.infer<
  typeof reproducibilityCapabilitiesResponseSchema
>

export const reproducibilityRolloutResponseSchema = z.object({
  status: reproducibilityRolloutStatusSchema,
  checks: z.array(reproducibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReproducibilityRolloutResponse = z.infer<
  typeof reproducibilityRolloutResponseSchema
>

export function getReproducibilityRolloutGuidance() {
  return 'Production reproducibility rollout validates idempotency reproducibility, workflow reproducibility signals, agent output coverage, and repeatability readiness before production reproducibility tooling.'
}
