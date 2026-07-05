import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const continuizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type ContinuizabilityAdminDomain = z.infer<typeof continuizabilityAdminDomainSchema>

export const continuizabilityAdminRecordSchema = z.object({
  domain: continuizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ContinuizabilityAdminRecord = z.infer<typeof continuizabilityAdminRecordSchema>

export const continuizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  continuizabilityPercent: z.number().min(0).max(100),
})
export type ContinuizabilityAdminStats = z.infer<typeof continuizabilityAdminStatsSchema>

export const continuizabilityAdminActionSchema = z.enum(['refresh_continuizability_summary'])
export type ContinuizabilityAdminAction = z.infer<typeof continuizabilityAdminActionSchema>

export const continuizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(continuizabilityAdminRecordSchema),
  stats: continuizabilityAdminStatsSchema,
  availableActions: z.array(continuizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ContinuizabilityAdminSummaryResponse = z.infer<
  typeof continuizabilityAdminSummaryResponseSchema
>

export const continuizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: continuizabilityAdminActionSchema,
})
export type ContinuizabilityAdminActionRequest = z.infer<
  typeof continuizabilityAdminActionRequestSchema
>

export const continuizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: continuizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: continuizabilityAdminStatsSchema.optional(),
})
export type ContinuizabilityAdminActionResponse = z.infer<
  typeof continuizabilityAdminActionResponseSchema
>
