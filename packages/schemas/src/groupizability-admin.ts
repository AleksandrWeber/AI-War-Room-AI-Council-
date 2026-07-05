import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const groupizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type GroupizabilityAdminDomain = z.infer<typeof groupizabilityAdminDomainSchema>

export const groupizabilityAdminRecordSchema = z.object({
  domain: groupizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GroupizabilityAdminRecord = z.infer<typeof groupizabilityAdminRecordSchema>

export const groupizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  groupizabilityPercent: z.number().min(0).max(100),
})
export type GroupizabilityAdminStats = z.infer<typeof groupizabilityAdminStatsSchema>

export const groupizabilityAdminActionSchema = z.enum(['refresh_groupizability_summary'])
export type GroupizabilityAdminAction = z.infer<typeof groupizabilityAdminActionSchema>

export const groupizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(groupizabilityAdminRecordSchema),
  stats: groupizabilityAdminStatsSchema,
  availableActions: z.array(groupizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GroupizabilityAdminSummaryResponse = z.infer<
  typeof groupizabilityAdminSummaryResponseSchema
>

export const groupizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: groupizabilityAdminActionSchema,
})
export type GroupizabilityAdminActionRequest = z.infer<
  typeof groupizabilityAdminActionRequestSchema
>

export const groupizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: groupizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: groupizabilityAdminStatsSchema.optional(),
})
export type GroupizabilityAdminActionResponse = z.infer<
  typeof groupizabilityAdminActionResponseSchema
>
