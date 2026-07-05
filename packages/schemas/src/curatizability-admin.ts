import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const curatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type CuratizabilityAdminDomain = z.infer<typeof curatizabilityAdminDomainSchema>

export const curatizabilityAdminRecordSchema = z.object({
  domain: curatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CuratizabilityAdminRecord = z.infer<typeof curatizabilityAdminRecordSchema>

export const curatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  curatizabilityPercent: z.number().min(0).max(100),
})
export type CuratizabilityAdminStats = z.infer<typeof curatizabilityAdminStatsSchema>

export const curatizabilityAdminActionSchema = z.enum(['refresh_curatizability_summary'])
export type CuratizabilityAdminAction = z.infer<typeof curatizabilityAdminActionSchema>

export const curatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(curatizabilityAdminRecordSchema),
  stats: curatizabilityAdminStatsSchema,
  availableActions: z.array(curatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CuratizabilityAdminSummaryResponse = z.infer<
  typeof curatizabilityAdminSummaryResponseSchema
>

export const curatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: curatizabilityAdminActionSchema,
})
export type CuratizabilityAdminActionRequest = z.infer<
  typeof curatizabilityAdminActionRequestSchema
>

export const curatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: curatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: curatizabilityAdminStatsSchema.optional(),
})
export type CuratizabilityAdminActionResponse = z.infer<
  typeof curatizabilityAdminActionResponseSchema
>
