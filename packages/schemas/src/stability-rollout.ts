import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const stabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StabilityRolloutCheckStatus = z.infer<
  typeof stabilityRolloutCheckStatusSchema
>

export const stabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: stabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StabilityRolloutCheck = z.infer<typeof stabilityRolloutCheckSchema>

export const stabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StabilityRolloutStatus = z.infer<typeof stabilityRolloutStatusSchema>

export const stabilityCapabilitiesResponseSchema = z.object({
  supportsStabilityRollout: z.literal(true),
  supportsStabilityAdminTools: z.literal(true),
  supportsArtifactPersistenceSignals: z.literal(true),
  supportsSchemaMigrationStability: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StabilityCapabilitiesResponse = z.infer<
  typeof stabilityCapabilitiesResponseSchema
>

export const stabilityRolloutResponseSchema = z.object({
  status: stabilityRolloutStatusSchema,
  checks: z.array(stabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StabilityRolloutResponse = z.infer<
  typeof stabilityRolloutResponseSchema
>

export function getStabilityRolloutGuidance() {
  return 'Production stability rollout validates schema migration stability, artifact persistence signals, run outcome coverage, and drift readiness before production stability tooling.'
}
