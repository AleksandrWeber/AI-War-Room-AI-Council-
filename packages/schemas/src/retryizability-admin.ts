import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const retryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type RetryizabilityAdminDomain = z.infer<typeof retryizabilityAdminDomainSchema>

export const retryizabilityAdminRecordSchema = z.object({
  domain: retryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RetryizabilityAdminRecord = z.infer<typeof retryizabilityAdminRecordSchema>

export const retryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  retryizabilityPercent: z.number().min(0).max(100),
})
export type RetryizabilityAdminStats = z.infer<typeof retryizabilityAdminStatsSchema>

export const retryizabilityAdminActionSchema = z.enum(['refresh_retryizability_summary'])
export type RetryizabilityAdminAction = z.infer<typeof retryizabilityAdminActionSchema>

export const retryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(retryizabilityAdminRecordSchema),
  stats: retryizabilityAdminStatsSchema,
  availableActions: z.array(retryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RetryizabilityAdminSummaryResponse = z.infer<
  typeof retryizabilityAdminSummaryResponseSchema
>

export const retryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retryizabilityAdminActionSchema,
})
export type RetryizabilityAdminActionRequest = z.infer<
  typeof retryizabilityAdminActionRequestSchema
>

export const retryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: retryizabilityAdminStatsSchema.optional(),
})
export type RetryizabilityAdminActionResponse = z.infer<
  typeof retryizabilityAdminActionResponseSchema
>
