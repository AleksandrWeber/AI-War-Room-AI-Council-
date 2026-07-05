import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const importizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type ImportizabilityAdminDomain = z.infer<typeof importizabilityAdminDomainSchema>

export const importizabilityAdminRecordSchema = z.object({
  domain: importizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ImportizabilityAdminRecord = z.infer<typeof importizabilityAdminRecordSchema>

export const importizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  importizabilityPercent: z.number().min(0).max(100),
})
export type ImportizabilityAdminStats = z.infer<typeof importizabilityAdminStatsSchema>

export const importizabilityAdminActionSchema = z.enum(['refresh_importizability_summary'])
export type ImportizabilityAdminAction = z.infer<typeof importizabilityAdminActionSchema>

export const importizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(importizabilityAdminRecordSchema),
  stats: importizabilityAdminStatsSchema,
  availableActions: z.array(importizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ImportizabilityAdminSummaryResponse = z.infer<
  typeof importizabilityAdminSummaryResponseSchema
>

export const importizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: importizabilityAdminActionSchema,
})
export type ImportizabilityAdminActionRequest = z.infer<
  typeof importizabilityAdminActionRequestSchema
>

export const importizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: importizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: importizabilityAdminStatsSchema.optional(),
})
export type ImportizabilityAdminActionResponse = z.infer<
  typeof importizabilityAdminActionResponseSchema
>
