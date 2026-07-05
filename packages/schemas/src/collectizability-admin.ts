import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const collectizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type CollectizabilityAdminDomain = z.infer<typeof collectizabilityAdminDomainSchema>

export const collectizabilityAdminRecordSchema = z.object({
  domain: collectizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CollectizabilityAdminRecord = z.infer<typeof collectizabilityAdminRecordSchema>

export const collectizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  collectizabilityPercent: z.number().min(0).max(100),
})
export type CollectizabilityAdminStats = z.infer<typeof collectizabilityAdminStatsSchema>

export const collectizabilityAdminActionSchema = z.enum(['refresh_collectizability_summary'])
export type CollectizabilityAdminAction = z.infer<typeof collectizabilityAdminActionSchema>

export const collectizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(collectizabilityAdminRecordSchema),
  stats: collectizabilityAdminStatsSchema,
  availableActions: z.array(collectizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CollectizabilityAdminSummaryResponse = z.infer<
  typeof collectizabilityAdminSummaryResponseSchema
>

export const collectizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: collectizabilityAdminActionSchema,
})
export type CollectizabilityAdminActionRequest = z.infer<
  typeof collectizabilityAdminActionRequestSchema
>

export const collectizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: collectizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: collectizabilityAdminStatsSchema.optional(),
})
export type CollectizabilityAdminActionResponse = z.infer<
  typeof collectizabilityAdminActionResponseSchema
>
