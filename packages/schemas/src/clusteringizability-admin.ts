import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const clusteringizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ClusteringizabilityAdminDomain = z.infer<typeof clusteringizabilityAdminDomainSchema>

export const clusteringizabilityAdminRecordSchema = z.object({
  domain: clusteringizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ClusteringizabilityAdminRecord = z.infer<typeof clusteringizabilityAdminRecordSchema>

export const clusteringizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  clusteringizabilityPercent: z.number().min(0).max(100),
})
export type ClusteringizabilityAdminStats = z.infer<typeof clusteringizabilityAdminStatsSchema>

export const clusteringizabilityAdminActionSchema = z.enum(['refresh_clusteringizability_summary'])
export type ClusteringizabilityAdminAction = z.infer<typeof clusteringizabilityAdminActionSchema>

export const clusteringizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(clusteringizabilityAdminRecordSchema),
  stats: clusteringizabilityAdminStatsSchema,
  availableActions: z.array(clusteringizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ClusteringizabilityAdminSummaryResponse = z.infer<
  typeof clusteringizabilityAdminSummaryResponseSchema
>

export const clusteringizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clusteringizabilityAdminActionSchema,
})
export type ClusteringizabilityAdminActionRequest = z.infer<
  typeof clusteringizabilityAdminActionRequestSchema
>

export const clusteringizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clusteringizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: clusteringizabilityAdminStatsSchema.optional(),
})
export type ClusteringizabilityAdminActionResponse = z.infer<
  typeof clusteringizabilityAdminActionResponseSchema
>
