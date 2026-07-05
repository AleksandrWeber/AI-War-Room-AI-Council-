import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const stochasticizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type StochasticizabilityAdminDomain = z.infer<typeof stochasticizabilityAdminDomainSchema>

export const stochasticizabilityAdminRecordSchema = z.object({
  domain: stochasticizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StochasticizabilityAdminRecord = z.infer<typeof stochasticizabilityAdminRecordSchema>

export const stochasticizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  stochasticizabilityPercent: z.number().min(0).max(100),
})
export type StochasticizabilityAdminStats = z.infer<typeof stochasticizabilityAdminStatsSchema>

export const stochasticizabilityAdminActionSchema = z.enum(['refresh_stochasticizability_summary'])
export type StochasticizabilityAdminAction = z.infer<typeof stochasticizabilityAdminActionSchema>

export const stochasticizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(stochasticizabilityAdminRecordSchema),
  stats: stochasticizabilityAdminStatsSchema,
  availableActions: z.array(stochasticizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StochasticizabilityAdminSummaryResponse = z.infer<
  typeof stochasticizabilityAdminSummaryResponseSchema
>

export const stochasticizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stochasticizabilityAdminActionSchema,
})
export type StochasticizabilityAdminActionRequest = z.infer<
  typeof stochasticizabilityAdminActionRequestSchema
>

export const stochasticizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stochasticizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: stochasticizabilityAdminStatsSchema.optional(),
})
export type StochasticizabilityAdminActionResponse = z.infer<
  typeof stochasticizabilityAdminActionResponseSchema
>
