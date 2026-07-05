import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const failoverizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type FailoverizabilityAdminDomain = z.infer<typeof failoverizabilityAdminDomainSchema>

export const failoverizabilityAdminRecordSchema = z.object({
  domain: failoverizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FailoverizabilityAdminRecord = z.infer<typeof failoverizabilityAdminRecordSchema>

export const failoverizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  failoverizabilityPercent: z.number().min(0).max(100),
})
export type FailoverizabilityAdminStats = z.infer<typeof failoverizabilityAdminStatsSchema>

export const failoverizabilityAdminActionSchema = z.enum(['refresh_failoverizability_summary'])
export type FailoverizabilityAdminAction = z.infer<typeof failoverizabilityAdminActionSchema>

export const failoverizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(failoverizabilityAdminRecordSchema),
  stats: failoverizabilityAdminStatsSchema,
  availableActions: z.array(failoverizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FailoverizabilityAdminSummaryResponse = z.infer<
  typeof failoverizabilityAdminSummaryResponseSchema
>

export const failoverizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: failoverizabilityAdminActionSchema,
})
export type FailoverizabilityAdminActionRequest = z.infer<
  typeof failoverizabilityAdminActionRequestSchema
>

export const failoverizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: failoverizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: failoverizabilityAdminStatsSchema.optional(),
})
export type FailoverizabilityAdminActionResponse = z.infer<
  typeof failoverizabilityAdminActionResponseSchema
>
