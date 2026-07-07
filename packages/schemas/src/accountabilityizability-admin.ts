import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const accountabilityizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AccountabilityizabilityAdminDomain = z.infer<typeof accountabilityizabilityAdminDomainSchema>

export const accountabilityizabilityAdminRecordSchema = z.object({
  domain: accountabilityizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AccountabilityizabilityAdminRecord = z.infer<typeof accountabilityizabilityAdminRecordSchema>

export const accountabilityizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  accountabilityizabilityPercent: z.number().min(0).max(100),
})
export type AccountabilityizabilityAdminStats = z.infer<typeof accountabilityizabilityAdminStatsSchema>

export const accountabilityizabilityAdminActionSchema = z.enum(['refresh_accountabilityizability_summary'])
export type AccountabilityizabilityAdminAction = z.infer<typeof accountabilityizabilityAdminActionSchema>

export const accountabilityizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(accountabilityizabilityAdminRecordSchema),
  stats: accountabilityizabilityAdminStatsSchema,
  availableActions: z.array(accountabilityizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AccountabilityizabilityAdminSummaryResponse = z.infer<
  typeof accountabilityizabilityAdminSummaryResponseSchema
>

export const accountabilityizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accountabilityizabilityAdminActionSchema,
})
export type AccountabilityizabilityAdminActionRequest = z.infer<
  typeof accountabilityizabilityAdminActionRequestSchema
>

export const accountabilityizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accountabilityizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: accountabilityizabilityAdminStatsSchema.optional(),
})
export type AccountabilityizabilityAdminActionResponse = z.infer<
  typeof accountabilityizabilityAdminActionResponseSchema
>
