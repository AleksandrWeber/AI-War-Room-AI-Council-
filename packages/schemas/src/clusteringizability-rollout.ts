import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const clusteringizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ClusteringizabilityRolloutCheckStatus = z.infer<
  typeof clusteringizabilityRolloutCheckStatusSchema
>

export const clusteringizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: clusteringizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ClusteringizabilityRolloutCheck = z.infer<typeof clusteringizabilityRolloutCheckSchema>

export const clusteringizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ClusteringizabilityRolloutStatus = z.infer<typeof clusteringizabilityRolloutStatusSchema>

export const clusteringizabilityCapabilitiesResponseSchema = z.object({
  supportsClusteringizabilityRollout: z.literal(true),
  supportsClusteringizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceClusteringizabilitySignals: z.literal(true),
  supportsBillingRecordClusteringizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ClusteringizabilityCapabilitiesResponse = z.infer<
  typeof clusteringizabilityCapabilitiesResponseSchema
>

export const clusteringizabilityRolloutResponseSchema = z.object({
  status: clusteringizabilityRolloutStatusSchema,
  checks: z.array(clusteringizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ClusteringizabilityRolloutResponse = z.infer<
  typeof clusteringizabilityRolloutResponseSchema
>

export function getClusteringizabilityRolloutGuidance() {
  return 'Production clusteringizability rollout validates billing invoice clusteringizability, billing record clusteringizability signals, billing webhook coverage, and clusteringization readiness before production clusteringizability tooling.'
}
