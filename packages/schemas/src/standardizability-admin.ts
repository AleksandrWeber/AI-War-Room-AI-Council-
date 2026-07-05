import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const standardizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type StandardizabilityAdminDomain = z.infer<typeof standardizabilityAdminDomainSchema>

export const standardizabilityAdminRecordSchema = z.object({
  domain: standardizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StandardizabilityAdminRecord = z.infer<typeof standardizabilityAdminRecordSchema>

export const standardizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  standardizabilityPercent: z.number().min(0).max(100),
})
export type StandardizabilityAdminStats = z.infer<typeof standardizabilityAdminStatsSchema>

export const standardizabilityAdminActionSchema = z.enum(['refresh_standardizability_summary'])
export type StandardizabilityAdminAction = z.infer<typeof standardizabilityAdminActionSchema>

export const standardizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(standardizabilityAdminRecordSchema),
  stats: standardizabilityAdminStatsSchema,
  availableActions: z.array(standardizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StandardizabilityAdminSummaryResponse = z.infer<
  typeof standardizabilityAdminSummaryResponseSchema
>

export const standardizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: standardizabilityAdminActionSchema,
})
export type StandardizabilityAdminActionRequest = z.infer<
  typeof standardizabilityAdminActionRequestSchema
>

export const standardizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: standardizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: standardizabilityAdminStatsSchema.optional(),
})
export type StandardizabilityAdminActionResponse = z.infer<
  typeof standardizabilityAdminActionResponseSchema
>
