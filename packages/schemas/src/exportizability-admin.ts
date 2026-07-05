import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const exportizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ExportizabilityAdminDomain = z.infer<typeof exportizabilityAdminDomainSchema>

export const exportizabilityAdminRecordSchema = z.object({
  domain: exportizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExportizabilityAdminRecord = z.infer<typeof exportizabilityAdminRecordSchema>

export const exportizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  exportizabilityPercent: z.number().min(0).max(100),
})
export type ExportizabilityAdminStats = z.infer<typeof exportizabilityAdminStatsSchema>

export const exportizabilityAdminActionSchema = z.enum(['refresh_exportizability_summary'])
export type ExportizabilityAdminAction = z.infer<typeof exportizabilityAdminActionSchema>

export const exportizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(exportizabilityAdminRecordSchema),
  stats: exportizabilityAdminStatsSchema,
  availableActions: z.array(exportizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExportizabilityAdminSummaryResponse = z.infer<
  typeof exportizabilityAdminSummaryResponseSchema
>

export const exportizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: exportizabilityAdminActionSchema,
})
export type ExportizabilityAdminActionRequest = z.infer<
  typeof exportizabilityAdminActionRequestSchema
>

export const exportizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: exportizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: exportizabilityAdminStatsSchema.optional(),
})
export type ExportizabilityAdminActionResponse = z.infer<
  typeof exportizabilityAdminActionResponseSchema
>
