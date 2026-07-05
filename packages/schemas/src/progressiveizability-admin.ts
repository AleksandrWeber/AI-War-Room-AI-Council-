import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const progressiveizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type ProgressiveizabilityAdminDomain = z.infer<typeof progressiveizabilityAdminDomainSchema>

export const progressiveizabilityAdminRecordSchema = z.object({
  domain: progressiveizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProgressiveizabilityAdminRecord = z.infer<typeof progressiveizabilityAdminRecordSchema>

export const progressiveizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  progressiveizabilityPercent: z.number().min(0).max(100),
})
export type ProgressiveizabilityAdminStats = z.infer<typeof progressiveizabilityAdminStatsSchema>

export const progressiveizabilityAdminActionSchema = z.enum(['refresh_progressiveizability_summary'])
export type ProgressiveizabilityAdminAction = z.infer<typeof progressiveizabilityAdminActionSchema>

export const progressiveizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(progressiveizabilityAdminRecordSchema),
  stats: progressiveizabilityAdminStatsSchema,
  availableActions: z.array(progressiveizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProgressiveizabilityAdminSummaryResponse = z.infer<
  typeof progressiveizabilityAdminSummaryResponseSchema
>

export const progressiveizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: progressiveizabilityAdminActionSchema,
})
export type ProgressiveizabilityAdminActionRequest = z.infer<
  typeof progressiveizabilityAdminActionRequestSchema
>

export const progressiveizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: progressiveizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: progressiveizabilityAdminStatsSchema.optional(),
})
export type ProgressiveizabilityAdminActionResponse = z.infer<
  typeof progressiveizabilityAdminActionResponseSchema
>
