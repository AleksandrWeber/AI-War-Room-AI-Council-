import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const hierarchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type HierarchizabilityAdminDomain = z.infer<typeof hierarchizabilityAdminDomainSchema>

export const hierarchizabilityAdminRecordSchema = z.object({
  domain: hierarchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HierarchizabilityAdminRecord = z.infer<typeof hierarchizabilityAdminRecordSchema>

export const hierarchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  hierarchizabilityPercent: z.number().min(0).max(100),
})
export type HierarchizabilityAdminStats = z.infer<typeof hierarchizabilityAdminStatsSchema>

export const hierarchizabilityAdminActionSchema = z.enum(['refresh_hierarchizability_summary'])
export type HierarchizabilityAdminAction = z.infer<typeof hierarchizabilityAdminActionSchema>

export const hierarchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(hierarchizabilityAdminRecordSchema),
  stats: hierarchizabilityAdminStatsSchema,
  availableActions: z.array(hierarchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HierarchizabilityAdminSummaryResponse = z.infer<
  typeof hierarchizabilityAdminSummaryResponseSchema
>

export const hierarchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hierarchizabilityAdminActionSchema,
})
export type HierarchizabilityAdminActionRequest = z.infer<
  typeof hierarchizabilityAdminActionRequestSchema
>

export const hierarchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hierarchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: hierarchizabilityAdminStatsSchema.optional(),
})
export type HierarchizabilityAdminActionResponse = z.infer<
  typeof hierarchizabilityAdminActionResponseSchema
>
