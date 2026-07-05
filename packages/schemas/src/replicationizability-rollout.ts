import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const replicationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReplicationizabilityRolloutCheckStatus = z.infer<
  typeof replicationizabilityRolloutCheckStatusSchema
>

export const replicationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: replicationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReplicationizabilityRolloutCheck = z.infer<typeof replicationizabilityRolloutCheckSchema>

export const replicationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReplicationizabilityRolloutStatus = z.infer<typeof replicationizabilityRolloutStatusSchema>

export const replicationizabilityCapabilitiesResponseSchema = z.object({
  supportsReplicationizabilityRollout: z.literal(true),
  supportsReplicationizabilityAdminTools: z.literal(true),
  supportsBillingWebhookReplicationizabilitySignals: z.literal(true),
  supportsBillingRecordReplicationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReplicationizabilityCapabilitiesResponse = z.infer<
  typeof replicationizabilityCapabilitiesResponseSchema
>

export const replicationizabilityRolloutResponseSchema = z.object({
  status: replicationizabilityRolloutStatusSchema,
  checks: z.array(replicationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReplicationizabilityRolloutResponse = z.infer<
  typeof replicationizabilityRolloutResponseSchema
>

export function getReplicationizabilityRolloutGuidance() {
  return 'Production replicationizability rollout validates billing webhook replicationizability, billing record replicationizability signals, usage event coverage, and interpolation readiness before production replicationizability tooling.'
}
