import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const partitionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type PartitionizabilityAdminDomain = z.infer<typeof partitionizabilityAdminDomainSchema>

export const partitionizabilityAdminRecordSchema = z.object({
  domain: partitionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PartitionizabilityAdminRecord = z.infer<typeof partitionizabilityAdminRecordSchema>

export const partitionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  partitionizabilityPercent: z.number().min(0).max(100),
})
export type PartitionizabilityAdminStats = z.infer<typeof partitionizabilityAdminStatsSchema>

export const partitionizabilityAdminActionSchema = z.enum(['refresh_partitionizability_summary'])
export type PartitionizabilityAdminAction = z.infer<typeof partitionizabilityAdminActionSchema>

export const partitionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(partitionizabilityAdminRecordSchema),
  stats: partitionizabilityAdminStatsSchema,
  availableActions: z.array(partitionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PartitionizabilityAdminSummaryResponse = z.infer<
  typeof partitionizabilityAdminSummaryResponseSchema
>

export const partitionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: partitionizabilityAdminActionSchema,
})
export type PartitionizabilityAdminActionRequest = z.infer<
  typeof partitionizabilityAdminActionRequestSchema
>

export const partitionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: partitionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: partitionizabilityAdminStatsSchema.optional(),
})
export type PartitionizabilityAdminActionResponse = z.infer<
  typeof partitionizabilityAdminActionResponseSchema
>
