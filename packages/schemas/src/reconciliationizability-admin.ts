import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reconciliationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ReconciliationizabilityAdminDomain = z.infer<typeof reconciliationizabilityAdminDomainSchema>

export const reconciliationizabilityAdminRecordSchema = z.object({
  domain: reconciliationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReconciliationizabilityAdminRecord = z.infer<typeof reconciliationizabilityAdminRecordSchema>

export const reconciliationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reconciliationizabilityPercent: z.number().min(0).max(100),
})
export type ReconciliationizabilityAdminStats = z.infer<typeof reconciliationizabilityAdminStatsSchema>

export const reconciliationizabilityAdminActionSchema = z.enum(['refresh_reconciliationizability_summary'])
export type ReconciliationizabilityAdminAction = z.infer<typeof reconciliationizabilityAdminActionSchema>

export const reconciliationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reconciliationizabilityAdminRecordSchema),
  stats: reconciliationizabilityAdminStatsSchema,
  availableActions: z.array(reconciliationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReconciliationizabilityAdminSummaryResponse = z.infer<
  typeof reconciliationizabilityAdminSummaryResponseSchema
>

export const reconciliationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reconciliationizabilityAdminActionSchema,
})
export type ReconciliationizabilityAdminActionRequest = z.infer<
  typeof reconciliationizabilityAdminActionRequestSchema
>

export const reconciliationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reconciliationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reconciliationizabilityAdminStatsSchema.optional(),
})
export type ReconciliationizabilityAdminActionResponse = z.infer<
  typeof reconciliationizabilityAdminActionResponseSchema
>
