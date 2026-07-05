import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const archiveizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ArchiveizabilityAdminDomain = z.infer<typeof archiveizabilityAdminDomainSchema>

export const archiveizabilityAdminRecordSchema = z.object({
  domain: archiveizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ArchiveizabilityAdminRecord = z.infer<typeof archiveizabilityAdminRecordSchema>

export const archiveizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  archiveizabilityPercent: z.number().min(0).max(100),
})
export type ArchiveizabilityAdminStats = z.infer<typeof archiveizabilityAdminStatsSchema>

export const archiveizabilityAdminActionSchema = z.enum(['refresh_archiveizability_summary'])
export type ArchiveizabilityAdminAction = z.infer<typeof archiveizabilityAdminActionSchema>

export const archiveizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(archiveizabilityAdminRecordSchema),
  stats: archiveizabilityAdminStatsSchema,
  availableActions: z.array(archiveizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ArchiveizabilityAdminSummaryResponse = z.infer<
  typeof archiveizabilityAdminSummaryResponseSchema
>

export const archiveizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archiveizabilityAdminActionSchema,
})
export type ArchiveizabilityAdminActionRequest = z.infer<
  typeof archiveizabilityAdminActionRequestSchema
>

export const archiveizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archiveizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: archiveizabilityAdminStatsSchema.optional(),
})
export type ArchiveizabilityAdminActionResponse = z.infer<
  typeof archiveizabilityAdminActionResponseSchema
>
