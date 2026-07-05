import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const loadbalancizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type LoadbalancizabilityAdminDomain = z.infer<typeof loadbalancizabilityAdminDomainSchema>

export const loadbalancizabilityAdminRecordSchema = z.object({
  domain: loadbalancizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LoadbalancizabilityAdminRecord = z.infer<typeof loadbalancizabilityAdminRecordSchema>

export const loadbalancizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  loadbalancizabilityPercent: z.number().min(0).max(100),
})
export type LoadbalancizabilityAdminStats = z.infer<typeof loadbalancizabilityAdminStatsSchema>

export const loadbalancizabilityAdminActionSchema = z.enum(['refresh_loadbalancizability_summary'])
export type LoadbalancizabilityAdminAction = z.infer<typeof loadbalancizabilityAdminActionSchema>

export const loadbalancizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(loadbalancizabilityAdminRecordSchema),
  stats: loadbalancizabilityAdminStatsSchema,
  availableActions: z.array(loadbalancizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LoadbalancizabilityAdminSummaryResponse = z.infer<
  typeof loadbalancizabilityAdminSummaryResponseSchema
>

export const loadbalancizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: loadbalancizabilityAdminActionSchema,
})
export type LoadbalancizabilityAdminActionRequest = z.infer<
  typeof loadbalancizabilityAdminActionRequestSchema
>

export const loadbalancizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: loadbalancizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: loadbalancizabilityAdminStatsSchema.optional(),
})
export type LoadbalancizabilityAdminActionResponse = z.infer<
  typeof loadbalancizabilityAdminActionResponseSchema
>
