import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sloAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'observability_errors',
])
export type SloAdminDomain = z.infer<typeof sloAdminDomainSchema>

export const sloAdminRecordSchema = z.object({
  domain: sloAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SloAdminRecord = z.infer<typeof sloAdminRecordSchema>

export const sloAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  successRatePercent: z.number().min(0).max(100),
})
export type SloAdminStats = z.infer<typeof sloAdminStatsSchema>

export const sloAdminActionSchema = z.enum(['refresh_slo_summary'])
export type SloAdminAction = z.infer<typeof sloAdminActionSchema>

export const sloAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sloAdminRecordSchema),
  stats: sloAdminStatsSchema,
  availableActions: z.array(sloAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SloAdminSummaryResponse = z.infer<
  typeof sloAdminSummaryResponseSchema
>

export const sloAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sloAdminActionSchema,
})
export type SloAdminActionRequest = z.infer<typeof sloAdminActionRequestSchema>

export const sloAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sloAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sloAdminStatsSchema.optional(),
})
export type SloAdminActionResponse = z.infer<
  typeof sloAdminActionResponseSchema
>
