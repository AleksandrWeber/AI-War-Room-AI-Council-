import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const refreshizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type RefreshizabilityAdminDomain = z.infer<typeof refreshizabilityAdminDomainSchema>

export const refreshizabilityAdminRecordSchema = z.object({
  domain: refreshizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RefreshizabilityAdminRecord = z.infer<typeof refreshizabilityAdminRecordSchema>

export const refreshizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  refreshizabilityPercent: z.number().min(0).max(100),
})
export type RefreshizabilityAdminStats = z.infer<typeof refreshizabilityAdminStatsSchema>

export const refreshizabilityAdminActionSchema = z.enum(['refresh_refreshizability_summary'])
export type RefreshizabilityAdminAction = z.infer<typeof refreshizabilityAdminActionSchema>

export const refreshizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(refreshizabilityAdminRecordSchema),
  stats: refreshizabilityAdminStatsSchema,
  availableActions: z.array(refreshizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RefreshizabilityAdminSummaryResponse = z.infer<
  typeof refreshizabilityAdminSummaryResponseSchema
>

export const refreshizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: refreshizabilityAdminActionSchema,
})
export type RefreshizabilityAdminActionRequest = z.infer<
  typeof refreshizabilityAdminActionRequestSchema
>

export const refreshizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: refreshizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: refreshizabilityAdminStatsSchema.optional(),
})
export type RefreshizabilityAdminActionResponse = z.infer<
  typeof refreshizabilityAdminActionResponseSchema
>
