import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const searchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type SearchizabilityAdminDomain = z.infer<typeof searchizabilityAdminDomainSchema>

export const searchizabilityAdminRecordSchema = z.object({
  domain: searchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SearchizabilityAdminRecord = z.infer<typeof searchizabilityAdminRecordSchema>

export const searchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  searchizabilityPercent: z.number().min(0).max(100),
})
export type SearchizabilityAdminStats = z.infer<typeof searchizabilityAdminStatsSchema>

export const searchizabilityAdminActionSchema = z.enum(['refresh_searchizability_summary'])
export type SearchizabilityAdminAction = z.infer<typeof searchizabilityAdminActionSchema>

export const searchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(searchizabilityAdminRecordSchema),
  stats: searchizabilityAdminStatsSchema,
  availableActions: z.array(searchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SearchizabilityAdminSummaryResponse = z.infer<
  typeof searchizabilityAdminSummaryResponseSchema
>

export const searchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: searchizabilityAdminActionSchema,
})
export type SearchizabilityAdminActionRequest = z.infer<
  typeof searchizabilityAdminActionRequestSchema
>

export const searchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: searchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: searchizabilityAdminStatsSchema.optional(),
})
export type SearchizabilityAdminActionResponse = z.infer<
  typeof searchizabilityAdminActionResponseSchema
>
