import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const topologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type TopologizabilityAdminDomain = z.infer<typeof topologizabilityAdminDomainSchema>

export const topologizabilityAdminRecordSchema = z.object({
  domain: topologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TopologizabilityAdminRecord = z.infer<typeof topologizabilityAdminRecordSchema>

export const topologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  topologizabilityPercent: z.number().min(0).max(100),
})
export type TopologizabilityAdminStats = z.infer<typeof topologizabilityAdminStatsSchema>

export const topologizabilityAdminActionSchema = z.enum(['refresh_topologizability_summary'])
export type TopologizabilityAdminAction = z.infer<typeof topologizabilityAdminActionSchema>

export const topologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(topologizabilityAdminRecordSchema),
  stats: topologizabilityAdminStatsSchema,
  availableActions: z.array(topologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TopologizabilityAdminSummaryResponse = z.infer<
  typeof topologizabilityAdminSummaryResponseSchema
>

export const topologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: topologizabilityAdminActionSchema,
})
export type TopologizabilityAdminActionRequest = z.infer<
  typeof topologizabilityAdminActionRequestSchema
>

export const topologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: topologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: topologizabilityAdminStatsSchema.optional(),
})
export type TopologizabilityAdminActionResponse = z.infer<
  typeof topologizabilityAdminActionResponseSchema
>
