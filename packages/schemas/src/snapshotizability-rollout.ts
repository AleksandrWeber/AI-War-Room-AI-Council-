import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const snapshotizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SnapshotizabilityRolloutCheckStatus = z.infer<
  typeof snapshotizabilityRolloutCheckStatusSchema
>

export const snapshotizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: snapshotizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SnapshotizabilityRolloutCheck = z.infer<typeof snapshotizabilityRolloutCheckSchema>

export const snapshotizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SnapshotizabilityRolloutStatus = z.infer<typeof snapshotizabilityRolloutStatusSchema>

export const snapshotizabilityCapabilitiesResponseSchema = z.object({
  supportsSnapshotizabilityRollout: z.literal(true),
  supportsSnapshotizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeySnapshotizabilitySignals: z.literal(true),
  supportsUsageEventSnapshotizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SnapshotizabilityCapabilitiesResponse = z.infer<
  typeof snapshotizabilityCapabilitiesResponseSchema
>

export const snapshotizabilityRolloutResponseSchema = z.object({
  status: snapshotizabilityRolloutStatusSchema,
  checks: z.array(snapshotizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SnapshotizabilityRolloutResponse = z.infer<
  typeof snapshotizabilityRolloutResponseSchema
>

export function getSnapshotizabilityRolloutGuidance() {
  return 'Production snapshotizability rollout validates idempotency key snapshotizability, usage event snapshotizability signals, billing webhook coverage, and snapshotization readiness before production snapshotizability tooling.'
}
