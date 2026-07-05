import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const backupizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type BackupizabilityAdminDomain = z.infer<typeof backupizabilityAdminDomainSchema>

export const backupizabilityAdminRecordSchema = z.object({
  domain: backupizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BackupizabilityAdminRecord = z.infer<typeof backupizabilityAdminRecordSchema>

export const backupizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  backupizabilityPercent: z.number().min(0).max(100),
})
export type BackupizabilityAdminStats = z.infer<typeof backupizabilityAdminStatsSchema>

export const backupizabilityAdminActionSchema = z.enum(['refresh_backupizability_summary'])
export type BackupizabilityAdminAction = z.infer<typeof backupizabilityAdminActionSchema>

export const backupizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(backupizabilityAdminRecordSchema),
  stats: backupizabilityAdminStatsSchema,
  availableActions: z.array(backupizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BackupizabilityAdminSummaryResponse = z.infer<
  typeof backupizabilityAdminSummaryResponseSchema
>

export const backupizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backupizabilityAdminActionSchema,
})
export type BackupizabilityAdminActionRequest = z.infer<
  typeof backupizabilityAdminActionRequestSchema
>

export const backupizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backupizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: backupizabilityAdminStatsSchema.optional(),
})
export type BackupizabilityAdminActionResponse = z.infer<
  typeof backupizabilityAdminActionResponseSchema
>
