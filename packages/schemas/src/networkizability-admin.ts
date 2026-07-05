import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const networkizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type NetworkizabilityAdminDomain = z.infer<typeof networkizabilityAdminDomainSchema>

export const networkizabilityAdminRecordSchema = z.object({
  domain: networkizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NetworkizabilityAdminRecord = z.infer<typeof networkizabilityAdminRecordSchema>

export const networkizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  networkizabilityPercent: z.number().min(0).max(100),
})
export type NetworkizabilityAdminStats = z.infer<typeof networkizabilityAdminStatsSchema>

export const networkizabilityAdminActionSchema = z.enum(['refresh_networkizability_summary'])
export type NetworkizabilityAdminAction = z.infer<typeof networkizabilityAdminActionSchema>

export const networkizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(networkizabilityAdminRecordSchema),
  stats: networkizabilityAdminStatsSchema,
  availableActions: z.array(networkizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NetworkizabilityAdminSummaryResponse = z.infer<
  typeof networkizabilityAdminSummaryResponseSchema
>

export const networkizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: networkizabilityAdminActionSchema,
})
export type NetworkizabilityAdminActionRequest = z.infer<
  typeof networkizabilityAdminActionRequestSchema
>

export const networkizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: networkizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: networkizabilityAdminStatsSchema.optional(),
})
export type NetworkizabilityAdminActionResponse = z.infer<
  typeof networkizabilityAdminActionResponseSchema
>
