import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const releaseRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReleaseRolloutCheckStatus = z.infer<
  typeof releaseRolloutCheckStatusSchema
>

export const releaseRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: releaseRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReleaseRolloutCheck = z.infer<typeof releaseRolloutCheckSchema>

export const releaseRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReleaseRolloutStatus = z.infer<typeof releaseRolloutStatusSchema>

export const releaseCapabilitiesResponseSchema = z.object({
  supportsReleaseRollout: z.literal(true),
  supportsReleaseAdminTools: z.literal(true),
  supportsApiVersionMetadata: z.literal(true),
  supportsReleaseArtifactTables: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReleaseCapabilitiesResponse = z.infer<
  typeof releaseCapabilitiesResponseSchema
>

export const releaseRolloutResponseSchema = z.object({
  status: releaseRolloutStatusSchema,
  checks: z.array(releaseRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReleaseRolloutResponse = z.infer<typeof releaseRolloutResponseSchema>

export function getReleaseRolloutGuidance() {
  return 'Production release rollout validates release artifact tables, API version metadata, and migration prerequisites before rollout-ready operations.'
}
