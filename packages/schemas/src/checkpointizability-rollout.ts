import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const checkpointizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CheckpointizabilityRolloutCheckStatus = z.infer<
  typeof checkpointizabilityRolloutCheckStatusSchema
>

export const checkpointizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: checkpointizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CheckpointizabilityRolloutCheck = z.infer<typeof checkpointizabilityRolloutCheckSchema>

export const checkpointizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CheckpointizabilityRolloutStatus = z.infer<typeof checkpointizabilityRolloutStatusSchema>

export const checkpointizabilityCapabilitiesResponseSchema = z.object({
  supportsCheckpointizabilityRollout: z.literal(true),
  supportsCheckpointizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceCheckpointizabilitySignals: z.literal(true),
  supportsBillingRecordCheckpointizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CheckpointizabilityCapabilitiesResponse = z.infer<
  typeof checkpointizabilityCapabilitiesResponseSchema
>

export const checkpointizabilityRolloutResponseSchema = z.object({
  status: checkpointizabilityRolloutStatusSchema,
  checks: z.array(checkpointizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CheckpointizabilityRolloutResponse = z.infer<
  typeof checkpointizabilityRolloutResponseSchema
>

export function getCheckpointizabilityRolloutGuidance() {
  return 'Production checkpointizability rollout validates billing invoice checkpointizability, billing record checkpointizability signals, billing webhook coverage, and checkpointization readiness before production checkpointizability tooling.'
}
