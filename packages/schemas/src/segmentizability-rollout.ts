import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const segmentizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SegmentizabilityRolloutCheckStatus = z.infer<
  typeof segmentizabilityRolloutCheckStatusSchema
>

export const segmentizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: segmentizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SegmentizabilityRolloutCheck = z.infer<typeof segmentizabilityRolloutCheckSchema>

export const segmentizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SegmentizabilityRolloutStatus = z.infer<typeof segmentizabilityRolloutStatusSchema>

export const segmentizabilityCapabilitiesResponseSchema = z.object({
  supportsSegmentizabilityRollout: z.literal(true),
  supportsSegmentizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitSegmentizabilitySignals: z.literal(true),
  supportsUsageEventSegmentizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SegmentizabilityCapabilitiesResponse = z.infer<
  typeof segmentizabilityCapabilitiesResponseSchema
>

export const segmentizabilityRolloutResponseSchema = z.object({
  status: segmentizabilityRolloutStatusSchema,
  checks: z.array(segmentizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SegmentizabilityRolloutResponse = z.infer<
  typeof segmentizabilityRolloutResponseSchema
>

export function getSegmentizabilityRolloutGuidance() {
  return 'Production segmentizability rollout validates workspace limit segmentizability, usage event segmentizability signals, billing record coverage, and segmentization readiness before production segmentizability tooling.'
}
