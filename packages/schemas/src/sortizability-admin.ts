import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sortizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type SortizabilityAdminDomain = z.infer<typeof sortizabilityAdminDomainSchema>

export const sortizabilityAdminRecordSchema = z.object({
  domain: sortizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SortizabilityAdminRecord = z.infer<typeof sortizabilityAdminRecordSchema>

export const sortizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  sortizabilityPercent: z.number().min(0).max(100),
})
export type SortizabilityAdminStats = z.infer<typeof sortizabilityAdminStatsSchema>

export const sortizabilityAdminActionSchema = z.enum(['refresh_sortizability_summary'])
export type SortizabilityAdminAction = z.infer<typeof sortizabilityAdminActionSchema>

export const sortizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sortizabilityAdminRecordSchema),
  stats: sortizabilityAdminStatsSchema,
  availableActions: z.array(sortizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SortizabilityAdminSummaryResponse = z.infer<
  typeof sortizabilityAdminSummaryResponseSchema
>

export const sortizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sortizabilityAdminActionSchema,
})
export type SortizabilityAdminActionRequest = z.infer<
  typeof sortizabilityAdminActionRequestSchema
>

export const sortizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sortizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sortizabilityAdminStatsSchema.optional(),
})
export type SortizabilityAdminActionResponse = z.infer<
  typeof sortizabilityAdminActionResponseSchema
>
