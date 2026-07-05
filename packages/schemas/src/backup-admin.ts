import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const backupAdminDomainSchema = z.enum([
  'runs',
  'artifacts',
  'usage_events',
  'workspace_memberships',
])
export type BackupAdminDomain = z.infer<typeof backupAdminDomainSchema>

export const backupAdminRecordSchema = z.object({
  domain: backupAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BackupAdminRecord = z.infer<typeof backupAdminRecordSchema>

export const backupAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  recoverableDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  redisBackedPersistence: z.boolean(),
})
export type BackupAdminStats = z.infer<typeof backupAdminStatsSchema>

export const backupAdminActionSchema = z.enum(['refresh_backup_summary'])
export type BackupAdminAction = z.infer<typeof backupAdminActionSchema>

export const backupAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(backupAdminRecordSchema),
  stats: backupAdminStatsSchema,
  availableActions: z.array(backupAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BackupAdminSummaryResponse = z.infer<
  typeof backupAdminSummaryResponseSchema
>

export const backupAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backupAdminActionSchema,
})
export type BackupAdminActionRequest = z.infer<
  typeof backupAdminActionRequestSchema
>

export const backupAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backupAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: backupAdminStatsSchema.optional(),
})
export type BackupAdminActionResponse = z.infer<
  typeof backupAdminActionResponseSchema
>
