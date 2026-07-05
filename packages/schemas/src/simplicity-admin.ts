import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const simplicityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'idempotency_keys',
])
export type SimplicityAdminDomain = z.infer<typeof simplicityAdminDomainSchema>

export const simplicityAdminRecordSchema = z.object({
  domain: simplicityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SimplicityAdminRecord = z.infer<typeof simplicityAdminRecordSchema>

export const simplicityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  simplicityPercent: z.number().min(0).max(100),
})
export type SimplicityAdminStats = z.infer<typeof simplicityAdminStatsSchema>

export const simplicityAdminActionSchema = z.enum(['refresh_simplicity_summary'])
export type SimplicityAdminAction = z.infer<typeof simplicityAdminActionSchema>

export const simplicityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(simplicityAdminRecordSchema),
  stats: simplicityAdminStatsSchema,
  availableActions: z.array(simplicityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SimplicityAdminSummaryResponse = z.infer<
  typeof simplicityAdminSummaryResponseSchema
>

export const simplicityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: simplicityAdminActionSchema,
})
export type SimplicityAdminActionRequest = z.infer<
  typeof simplicityAdminActionRequestSchema
>

export const simplicityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: simplicityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: simplicityAdminStatsSchema.optional(),
})
export type SimplicityAdminActionResponse = z.infer<
  typeof simplicityAdminActionResponseSchema
>
