import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const rebalanceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type RebalanceizabilityAdminDomain = z.infer<typeof rebalanceizabilityAdminDomainSchema>

export const rebalanceizabilityAdminRecordSchema = z.object({
  domain: rebalanceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RebalanceizabilityAdminRecord = z.infer<typeof rebalanceizabilityAdminRecordSchema>

export const rebalanceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  rebalanceizabilityPercent: z.number().min(0).max(100),
})
export type RebalanceizabilityAdminStats = z.infer<typeof rebalanceizabilityAdminStatsSchema>

export const rebalanceizabilityAdminActionSchema = z.enum(['refresh_rebalanceizability_summary'])
export type RebalanceizabilityAdminAction = z.infer<typeof rebalanceizabilityAdminActionSchema>

export const rebalanceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(rebalanceizabilityAdminRecordSchema),
  stats: rebalanceizabilityAdminStatsSchema,
  availableActions: z.array(rebalanceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RebalanceizabilityAdminSummaryResponse = z.infer<
  typeof rebalanceizabilityAdminSummaryResponseSchema
>

export const rebalanceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rebalanceizabilityAdminActionSchema,
})
export type RebalanceizabilityAdminActionRequest = z.infer<
  typeof rebalanceizabilityAdminActionRequestSchema
>

export const rebalanceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rebalanceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: rebalanceizabilityAdminStatsSchema.optional(),
})
export type RebalanceizabilityAdminActionResponse = z.infer<
  typeof rebalanceizabilityAdminActionResponseSchema
>
