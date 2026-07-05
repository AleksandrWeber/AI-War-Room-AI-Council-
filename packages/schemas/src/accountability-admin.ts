import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const accountabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'billing_records',
])
export type AccountabilityAdminDomain = z.infer<
  typeof accountabilityAdminDomainSchema
>

export const accountabilityAdminRecordSchema = z.object({
  domain: accountabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AccountabilityAdminRecord = z.infer<
  typeof accountabilityAdminRecordSchema
>

export const accountabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  accountabilityPercent: z.number().min(0).max(100),
})
export type AccountabilityAdminStats = z.infer<
  typeof accountabilityAdminStatsSchema
>

export const accountabilityAdminActionSchema = z.enum([
  'refresh_accountability_summary',
])
export type AccountabilityAdminAction = z.infer<
  typeof accountabilityAdminActionSchema
>

export const accountabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(accountabilityAdminRecordSchema),
  stats: accountabilityAdminStatsSchema,
  availableActions: z.array(accountabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AccountabilityAdminSummaryResponse = z.infer<
  typeof accountabilityAdminSummaryResponseSchema
>

export const accountabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accountabilityAdminActionSchema,
})
export type AccountabilityAdminActionRequest = z.infer<
  typeof accountabilityAdminActionRequestSchema
>

export const accountabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accountabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: accountabilityAdminStatsSchema.optional(),
})
export type AccountabilityAdminActionResponse = z.infer<
  typeof accountabilityAdminActionResponseSchema
>
