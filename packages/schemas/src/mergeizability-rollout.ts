import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const mergeizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MergeizabilityRolloutCheckStatus = z.infer<
  typeof mergeizabilityRolloutCheckStatusSchema
>

export const mergeizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: mergeizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MergeizabilityRolloutCheck = z.infer<typeof mergeizabilityRolloutCheckSchema>

export const mergeizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MergeizabilityRolloutStatus = z.infer<typeof mergeizabilityRolloutStatusSchema>

export const mergeizabilityCapabilitiesResponseSchema = z.object({
  supportsMergeizabilityRollout: z.literal(true),
  supportsMergeizabilityAdminTools: z.literal(true),
  supportsMembershipMergeizabilitySignals: z.literal(true),
  supportsUsageEventMergeizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MergeizabilityCapabilitiesResponse = z.infer<
  typeof mergeizabilityCapabilitiesResponseSchema
>

export const mergeizabilityRolloutResponseSchema = z.object({
  status: mergeizabilityRolloutStatusSchema,
  checks: z.array(mergeizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MergeizabilityRolloutResponse = z.infer<
  typeof mergeizabilityRolloutResponseSchema
>

export function getMergeizabilityRolloutGuidance() {
  return 'Production mergeizability rollout validates membership mergeizability, usage event mergeizability signals, billing notification coverage, and mergeization readiness before production mergeizability tooling.'
}
