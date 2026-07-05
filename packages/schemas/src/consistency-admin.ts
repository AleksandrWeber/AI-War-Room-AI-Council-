import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const consistencyAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'idempotency_keys',
])
export type ConsistencyAdminDomain = z.infer<
  typeof consistencyAdminDomainSchema
>

export const consistencyAdminRecordSchema = z.object({
  domain: consistencyAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConsistencyAdminRecord = z.infer<
  typeof consistencyAdminRecordSchema
>

export const consistencyAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  consistencyPercent: z.number().min(0).max(100),
})
export type ConsistencyAdminStats = z.infer<
  typeof consistencyAdminStatsSchema
>

export const consistencyAdminActionSchema = z.enum([
  'refresh_consistency_summary',
])
export type ConsistencyAdminAction = z.infer<
  typeof consistencyAdminActionSchema
>

export const consistencyAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(consistencyAdminRecordSchema),
  stats: consistencyAdminStatsSchema,
  availableActions: z.array(consistencyAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConsistencyAdminSummaryResponse = z.infer<
  typeof consistencyAdminSummaryResponseSchema
>

export const consistencyAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consistencyAdminActionSchema,
})
export type ConsistencyAdminActionRequest = z.infer<
  typeof consistencyAdminActionRequestSchema
>

export const consistencyAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consistencyAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: consistencyAdminStatsSchema.optional(),
})
export type ConsistencyAdminActionResponse = z.infer<
  typeof consistencyAdminActionResponseSchema
>
