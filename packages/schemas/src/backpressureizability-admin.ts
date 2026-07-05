import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const backpressureizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type BackpressureizabilityAdminDomain = z.infer<typeof backpressureizabilityAdminDomainSchema>

export const backpressureizabilityAdminRecordSchema = z.object({
  domain: backpressureizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BackpressureizabilityAdminRecord = z.infer<typeof backpressureizabilityAdminRecordSchema>

export const backpressureizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  backpressureizabilityPercent: z.number().min(0).max(100),
})
export type BackpressureizabilityAdminStats = z.infer<typeof backpressureizabilityAdminStatsSchema>

export const backpressureizabilityAdminActionSchema = z.enum(['refresh_backpressureizability_summary'])
export type BackpressureizabilityAdminAction = z.infer<typeof backpressureizabilityAdminActionSchema>

export const backpressureizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(backpressureizabilityAdminRecordSchema),
  stats: backpressureizabilityAdminStatsSchema,
  availableActions: z.array(backpressureizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BackpressureizabilityAdminSummaryResponse = z.infer<
  typeof backpressureizabilityAdminSummaryResponseSchema
>

export const backpressureizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backpressureizabilityAdminActionSchema,
})
export type BackpressureizabilityAdminActionRequest = z.infer<
  typeof backpressureizabilityAdminActionRequestSchema
>

export const backpressureizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: backpressureizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: backpressureizabilityAdminStatsSchema.optional(),
})
export type BackpressureizabilityAdminActionResponse = z.infer<
  typeof backpressureizabilityAdminActionResponseSchema
>
