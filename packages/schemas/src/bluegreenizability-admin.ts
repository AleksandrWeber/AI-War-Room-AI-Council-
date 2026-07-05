import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const bluegreenizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type BluegreenizabilityAdminDomain = z.infer<typeof bluegreenizabilityAdminDomainSchema>

export const bluegreenizabilityAdminRecordSchema = z.object({
  domain: bluegreenizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BluegreenizabilityAdminRecord = z.infer<typeof bluegreenizabilityAdminRecordSchema>

export const bluegreenizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  bluegreenizabilityPercent: z.number().min(0).max(100),
})
export type BluegreenizabilityAdminStats = z.infer<typeof bluegreenizabilityAdminStatsSchema>

export const bluegreenizabilityAdminActionSchema = z.enum(['refresh_bluegreenizability_summary'])
export type BluegreenizabilityAdminAction = z.infer<typeof bluegreenizabilityAdminActionSchema>

export const bluegreenizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(bluegreenizabilityAdminRecordSchema),
  stats: bluegreenizabilityAdminStatsSchema,
  availableActions: z.array(bluegreenizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BluegreenizabilityAdminSummaryResponse = z.infer<
  typeof bluegreenizabilityAdminSummaryResponseSchema
>

export const bluegreenizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bluegreenizabilityAdminActionSchema,
})
export type BluegreenizabilityAdminActionRequest = z.infer<
  typeof bluegreenizabilityAdminActionRequestSchema
>

export const bluegreenizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bluegreenizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: bluegreenizabilityAdminStatsSchema.optional(),
})
export type BluegreenizabilityAdminActionResponse = z.infer<
  typeof bluegreenizabilityAdminActionResponseSchema
>
