import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const comparabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_meter_usage_reports',
])
export type ComparabilityAdminDomain = z.infer<typeof comparabilityAdminDomainSchema>

export const comparabilityAdminRecordSchema = z.object({
  domain: comparabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComparabilityAdminRecord = z.infer<typeof comparabilityAdminRecordSchema>

export const comparabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  comparabilityPercent: z.number().min(0).max(100),
})
export type ComparabilityAdminStats = z.infer<typeof comparabilityAdminStatsSchema>

export const comparabilityAdminActionSchema = z.enum(['refresh_comparability_summary'])
export type ComparabilityAdminAction = z.infer<typeof comparabilityAdminActionSchema>

export const comparabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(comparabilityAdminRecordSchema),
  stats: comparabilityAdminStatsSchema,
  availableActions: z.array(comparabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComparabilityAdminSummaryResponse = z.infer<
  typeof comparabilityAdminSummaryResponseSchema
>

export const comparabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparabilityAdminActionSchema,
})
export type ComparabilityAdminActionRequest = z.infer<
  typeof comparabilityAdminActionRequestSchema
>

export const comparabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: comparabilityAdminStatsSchema.optional(),
})
export type ComparabilityAdminActionResponse = z.infer<
  typeof comparabilityAdminActionResponseSchema
>
