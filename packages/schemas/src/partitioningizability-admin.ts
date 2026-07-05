import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const partitioningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type PartitioningizabilityAdminDomain = z.infer<typeof partitioningizabilityAdminDomainSchema>

export const partitioningizabilityAdminRecordSchema = z.object({
  domain: partitioningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PartitioningizabilityAdminRecord = z.infer<typeof partitioningizabilityAdminRecordSchema>

export const partitioningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  partitioningizabilityPercent: z.number().min(0).max(100),
})
export type PartitioningizabilityAdminStats = z.infer<typeof partitioningizabilityAdminStatsSchema>

export const partitioningizabilityAdminActionSchema = z.enum(['refresh_partitioningizability_summary'])
export type PartitioningizabilityAdminAction = z.infer<typeof partitioningizabilityAdminActionSchema>

export const partitioningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(partitioningizabilityAdminRecordSchema),
  stats: partitioningizabilityAdminStatsSchema,
  availableActions: z.array(partitioningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PartitioningizabilityAdminSummaryResponse = z.infer<
  typeof partitioningizabilityAdminSummaryResponseSchema
>

export const partitioningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: partitioningizabilityAdminActionSchema,
})
export type PartitioningizabilityAdminActionRequest = z.infer<
  typeof partitioningizabilityAdminActionRequestSchema
>

export const partitioningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: partitioningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: partitioningizabilityAdminStatsSchema.optional(),
})
export type PartitioningizabilityAdminActionResponse = z.infer<
  typeof partitioningizabilityAdminActionResponseSchema
>
