import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const coldizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ColdizabilityAdminDomain = z.infer<typeof coldizabilityAdminDomainSchema>

export const coldizabilityAdminRecordSchema = z.object({
  domain: coldizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ColdizabilityAdminRecord = z.infer<typeof coldizabilityAdminRecordSchema>

export const coldizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  coldizabilityPercent: z.number().min(0).max(100),
})
export type ColdizabilityAdminStats = z.infer<typeof coldizabilityAdminStatsSchema>

export const coldizabilityAdminActionSchema = z.enum(['refresh_coldizability_summary'])
export type ColdizabilityAdminAction = z.infer<typeof coldizabilityAdminActionSchema>

export const coldizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(coldizabilityAdminRecordSchema),
  stats: coldizabilityAdminStatsSchema,
  availableActions: z.array(coldizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ColdizabilityAdminSummaryResponse = z.infer<
  typeof coldizabilityAdminSummaryResponseSchema
>

export const coldizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coldizabilityAdminActionSchema,
})
export type ColdizabilityAdminActionRequest = z.infer<
  typeof coldizabilityAdminActionRequestSchema
>

export const coldizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coldizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: coldizabilityAdminStatsSchema.optional(),
})
export type ColdizabilityAdminActionResponse = z.infer<
  typeof coldizabilityAdminActionResponseSchema
>
