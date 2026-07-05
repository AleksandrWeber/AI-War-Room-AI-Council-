import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const regressizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type RegressizabilityAdminDomain = z.infer<typeof regressizabilityAdminDomainSchema>

export const regressizabilityAdminRecordSchema = z.object({
  domain: regressizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegressizabilityAdminRecord = z.infer<typeof regressizabilityAdminRecordSchema>

export const regressizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  regressizabilityPercent: z.number().min(0).max(100),
})
export type RegressizabilityAdminStats = z.infer<typeof regressizabilityAdminStatsSchema>

export const regressizabilityAdminActionSchema = z.enum(['refresh_regressizability_summary'])
export type RegressizabilityAdminAction = z.infer<typeof regressizabilityAdminActionSchema>

export const regressizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(regressizabilityAdminRecordSchema),
  stats: regressizabilityAdminStatsSchema,
  availableActions: z.array(regressizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegressizabilityAdminSummaryResponse = z.infer<
  typeof regressizabilityAdminSummaryResponseSchema
>

export const regressizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: regressizabilityAdminActionSchema,
})
export type RegressizabilityAdminActionRequest = z.infer<
  typeof regressizabilityAdminActionRequestSchema
>

export const regressizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: regressizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: regressizabilityAdminStatsSchema.optional(),
})
export type RegressizabilityAdminActionResponse = z.infer<
  typeof regressizabilityAdminActionResponseSchema
>
