import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const distributizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type DistributizabilityAdminDomain = z.infer<typeof distributizabilityAdminDomainSchema>

export const distributizabilityAdminRecordSchema = z.object({
  domain: distributizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DistributizabilityAdminRecord = z.infer<typeof distributizabilityAdminRecordSchema>

export const distributizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  distributizabilityPercent: z.number().min(0).max(100),
})
export type DistributizabilityAdminStats = z.infer<typeof distributizabilityAdminStatsSchema>

export const distributizabilityAdminActionSchema = z.enum(['refresh_distributizability_summary'])
export type DistributizabilityAdminAction = z.infer<typeof distributizabilityAdminActionSchema>

export const distributizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(distributizabilityAdminRecordSchema),
  stats: distributizabilityAdminStatsSchema,
  availableActions: z.array(distributizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DistributizabilityAdminSummaryResponse = z.infer<
  typeof distributizabilityAdminSummaryResponseSchema
>

export const distributizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distributizabilityAdminActionSchema,
})
export type DistributizabilityAdminActionRequest = z.infer<
  typeof distributizabilityAdminActionRequestSchema
>

export const distributizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distributizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: distributizabilityAdminStatsSchema.optional(),
})
export type DistributizabilityAdminActionResponse = z.infer<
  typeof distributizabilityAdminActionResponseSchema
>
