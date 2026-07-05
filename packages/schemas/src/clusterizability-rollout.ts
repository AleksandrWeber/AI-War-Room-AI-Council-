import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const clusterizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ClusterizabilityRolloutCheckStatus = z.infer<
  typeof clusterizabilityRolloutCheckStatusSchema
>

export const clusterizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: clusterizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ClusterizabilityRolloutCheck = z.infer<typeof clusterizabilityRolloutCheckSchema>

export const clusterizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ClusterizabilityRolloutStatus = z.infer<typeof clusterizabilityRolloutStatusSchema>

export const clusterizabilityCapabilitiesResponseSchema = z.object({
  supportsClusterizabilityRollout: z.literal(true),
  supportsClusterizabilityAdminTools: z.literal(true),
  supportsProviderCredentialClusterizabilitySignals: z.literal(true),
  supportsModelRegistryClusterizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ClusterizabilityCapabilitiesResponse = z.infer<
  typeof clusterizabilityCapabilitiesResponseSchema
>

export const clusterizabilityRolloutResponseSchema = z.object({
  status: clusterizabilityRolloutStatusSchema,
  checks: z.array(clusterizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ClusterizabilityRolloutResponse = z.infer<
  typeof clusterizabilityRolloutResponseSchema
>

export function getClusterizabilityRolloutGuidance() {
  return 'Production clusterizability rollout validates provider credential clusterizability, model registry clusterizability signals, billing webhook coverage, and clusterization readiness before production clusterizability tooling.'
}
