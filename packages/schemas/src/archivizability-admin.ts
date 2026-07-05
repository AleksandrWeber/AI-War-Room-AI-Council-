import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const archivizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ArchivizabilityAdminDomain = z.infer<typeof archivizabilityAdminDomainSchema>

export const archivizabilityAdminRecordSchema = z.object({
  domain: archivizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ArchivizabilityAdminRecord = z.infer<typeof archivizabilityAdminRecordSchema>

export const archivizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  archivizabilityPercent: z.number().min(0).max(100),
})
export type ArchivizabilityAdminStats = z.infer<typeof archivizabilityAdminStatsSchema>

export const archivizabilityAdminActionSchema = z.enum(['refresh_archivizability_summary'])
export type ArchivizabilityAdminAction = z.infer<typeof archivizabilityAdminActionSchema>

export const archivizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(archivizabilityAdminRecordSchema),
  stats: archivizabilityAdminStatsSchema,
  availableActions: z.array(archivizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ArchivizabilityAdminSummaryResponse = z.infer<
  typeof archivizabilityAdminSummaryResponseSchema
>

export const archivizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archivizabilityAdminActionSchema,
})
export type ArchivizabilityAdminActionRequest = z.infer<
  typeof archivizabilityAdminActionRequestSchema
>

export const archivizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archivizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: archivizabilityAdminStatsSchema.optional(),
})
export type ArchivizabilityAdminActionResponse = z.infer<
  typeof archivizabilityAdminActionResponseSchema
>
