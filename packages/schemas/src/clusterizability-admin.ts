import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const clusterizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type ClusterizabilityAdminDomain = z.infer<typeof clusterizabilityAdminDomainSchema>

export const clusterizabilityAdminRecordSchema = z.object({
  domain: clusterizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ClusterizabilityAdminRecord = z.infer<typeof clusterizabilityAdminRecordSchema>

export const clusterizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  clusterizabilityPercent: z.number().min(0).max(100),
})
export type ClusterizabilityAdminStats = z.infer<typeof clusterizabilityAdminStatsSchema>

export const clusterizabilityAdminActionSchema = z.enum(['refresh_clusterizability_summary'])
export type ClusterizabilityAdminAction = z.infer<typeof clusterizabilityAdminActionSchema>

export const clusterizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(clusterizabilityAdminRecordSchema),
  stats: clusterizabilityAdminStatsSchema,
  availableActions: z.array(clusterizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ClusterizabilityAdminSummaryResponse = z.infer<
  typeof clusterizabilityAdminSummaryResponseSchema
>

export const clusterizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clusterizabilityAdminActionSchema,
})
export type ClusterizabilityAdminActionRequest = z.infer<
  typeof clusterizabilityAdminActionRequestSchema
>

export const clusterizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clusterizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: clusterizabilityAdminStatsSchema.optional(),
})
export type ClusterizabilityAdminActionResponse = z.infer<
  typeof clusterizabilityAdminActionResponseSchema
>
