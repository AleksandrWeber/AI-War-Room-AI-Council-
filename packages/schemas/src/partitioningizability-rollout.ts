import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const partitioningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PartitioningizabilityRolloutCheckStatus = z.infer<
  typeof partitioningizabilityRolloutCheckStatusSchema
>

export const partitioningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: partitioningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PartitioningizabilityRolloutCheck = z.infer<typeof partitioningizabilityRolloutCheckSchema>

export const partitioningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PartitioningizabilityRolloutStatus = z.infer<typeof partitioningizabilityRolloutStatusSchema>

export const partitioningizabilityCapabilitiesResponseSchema = z.object({
  supportsPartitioningizabilityRollout: z.literal(true),
  supportsPartitioningizabilityAdminTools: z.literal(true),
  supportsMembershipPartitioningizabilitySignals: z.literal(true),
  supportsUsageEventPartitioningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PartitioningizabilityCapabilitiesResponse = z.infer<
  typeof partitioningizabilityCapabilitiesResponseSchema
>

export const partitioningizabilityRolloutResponseSchema = z.object({
  status: partitioningizabilityRolloutStatusSchema,
  checks: z.array(partitioningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PartitioningizabilityRolloutResponse = z.infer<
  typeof partitioningizabilityRolloutResponseSchema
>

export function getPartitioningizabilityRolloutGuidance() {
  return 'Production partitioningizability rollout validates membership partitioningizability, usage event partitioningizability signals, billing notification coverage, and partitioningization readiness before production partitioningizability tooling.'
}
