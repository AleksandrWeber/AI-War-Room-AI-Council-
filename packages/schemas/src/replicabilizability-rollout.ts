import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const replicabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReplicabilizabilityRolloutCheckStatus = z.infer<
  typeof replicabilizabilityRolloutCheckStatusSchema
>

export const replicabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: replicabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReplicabilizabilityRolloutCheck = z.infer<typeof replicabilizabilityRolloutCheckSchema>

export const replicabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReplicabilizabilityRolloutStatus = z.infer<typeof replicabilizabilityRolloutStatusSchema>

export const replicabilizabilityCapabilitiesResponseSchema = z.object({
  supportsReplicabilizabilityRollout: z.literal(true),
  supportsReplicabilizabilityAdminTools: z.literal(true),
  supportsMeterUsageReplicabilizabilitySignals: z.literal(true),
  supportsUsageEventReplicabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReplicabilizabilityCapabilitiesResponse = z.infer<
  typeof replicabilizabilityCapabilitiesResponseSchema
>

export const replicabilizabilityRolloutResponseSchema = z.object({
  status: replicabilizabilityRolloutStatusSchema,
  checks: z.array(replicabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReplicabilizabilityRolloutResponse = z.infer<
  typeof replicabilizabilityRolloutResponseSchema
>

export function getReplicabilizabilityRolloutGuidance() {
  return 'Production replicabilizability rollout validates meter usage replicabilizability, usage event replicabilizability signals, workspace limit coverage, and replicabilization readiness before production replicabilizability tooling.'
}
