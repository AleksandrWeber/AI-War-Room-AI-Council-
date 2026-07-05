import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const versioningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VersioningizabilityRolloutCheckStatus = z.infer<
  typeof versioningizabilityRolloutCheckStatusSchema
>

export const versioningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: versioningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VersioningizabilityRolloutCheck = z.infer<typeof versioningizabilityRolloutCheckSchema>

export const versioningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VersioningizabilityRolloutStatus = z.infer<typeof versioningizabilityRolloutStatusSchema>

export const versioningizabilityCapabilitiesResponseSchema = z.object({
  supportsVersioningizabilityRollout: z.literal(true),
  supportsVersioningizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyVersioningizabilitySignals: z.literal(true),
  supportsUsageEventVersioningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VersioningizabilityCapabilitiesResponse = z.infer<
  typeof versioningizabilityCapabilitiesResponseSchema
>

export const versioningizabilityRolloutResponseSchema = z.object({
  status: versioningizabilityRolloutStatusSchema,
  checks: z.array(versioningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VersioningizabilityRolloutResponse = z.infer<
  typeof versioningizabilityRolloutResponseSchema
>

export function getVersioningizabilityRolloutGuidance() {
  return 'Production versioningizability rollout validates idempotency key versioningizability, usage event versioningizability signals, billing webhook coverage, and versioningization readiness before production versioningizability tooling.'
}
