import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const resilienceAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'applied_migrations',
])
export type ResilienceAdminDomain = z.infer<typeof resilienceAdminDomainSchema>

export const resilienceAdminRecordSchema = z.object({
  domain: resilienceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ResilienceAdminRecord = z.infer<typeof resilienceAdminRecordSchema>

export const resilienceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  recoveryReadinessPercent: z.number().min(0).max(100),
})
export type ResilienceAdminStats = z.infer<typeof resilienceAdminStatsSchema>

export const resilienceAdminActionSchema = z.enum(['refresh_resilience_summary'])
export type ResilienceAdminAction = z.infer<typeof resilienceAdminActionSchema>

export const resilienceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(resilienceAdminRecordSchema),
  stats: resilienceAdminStatsSchema,
  availableActions: z.array(resilienceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ResilienceAdminSummaryResponse = z.infer<
  typeof resilienceAdminSummaryResponseSchema
>

export const resilienceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: resilienceAdminActionSchema,
})
export type ResilienceAdminActionRequest = z.infer<
  typeof resilienceAdminActionRequestSchema
>

export const resilienceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: resilienceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: resilienceAdminStatsSchema.optional(),
})
export type ResilienceAdminActionResponse = z.infer<
  typeof resilienceAdminActionResponseSchema
>
