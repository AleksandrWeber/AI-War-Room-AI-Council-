import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const partitionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PartitionizabilityRolloutCheckStatus = z.infer<
  typeof partitionizabilityRolloutCheckStatusSchema
>

export const partitionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: partitionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PartitionizabilityRolloutCheck = z.infer<typeof partitionizabilityRolloutCheckSchema>

export const partitionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PartitionizabilityRolloutStatus = z.infer<typeof partitionizabilityRolloutStatusSchema>

export const partitionizabilityCapabilitiesResponseSchema = z.object({
  supportsPartitionizabilityRollout: z.literal(true),
  supportsPartitionizabilityAdminTools: z.literal(true),
  supportsShieldScanPartitionizabilitySignals: z.literal(true),
  supportsProviderCredentialPartitionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PartitionizabilityCapabilitiesResponse = z.infer<
  typeof partitionizabilityCapabilitiesResponseSchema
>

export const partitionizabilityRolloutResponseSchema = z.object({
  status: partitionizabilityRolloutStatusSchema,
  checks: z.array(partitionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PartitionizabilityRolloutResponse = z.infer<
  typeof partitionizabilityRolloutResponseSchema
>

export function getPartitionizabilityRolloutGuidance() {
  return 'Production partitionizability rollout validates shield scan partitionizability, provider credential partitionizability signals, billing webhook coverage, and partitionization readiness before production partitionizability tooling.'
}
