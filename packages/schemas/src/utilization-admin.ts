import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const utilizationAdminDomainSchema = z.enum([
  'active_runs',
  'completed_runs',
  'usage_events',
  'workspace_memberships',
])
export type UtilizationAdminDomain = z.infer<
  typeof utilizationAdminDomainSchema
>

export const utilizationAdminRecordSchema = z.object({
  domain: utilizationAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type UtilizationAdminRecord = z.infer<
  typeof utilizationAdminRecordSchema
>

export const utilizationAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  utilizationPercent: z.number().min(0).max(100),
})
export type UtilizationAdminStats = z.infer<
  typeof utilizationAdminStatsSchema
>

export const utilizationAdminActionSchema = z.enum([
  'refresh_utilization_summary',
])
export type UtilizationAdminAction = z.infer<
  typeof utilizationAdminActionSchema
>

export const utilizationAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(utilizationAdminRecordSchema),
  stats: utilizationAdminStatsSchema,
  availableActions: z.array(utilizationAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UtilizationAdminSummaryResponse = z.infer<
  typeof utilizationAdminSummaryResponseSchema
>

export const utilizationAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: utilizationAdminActionSchema,
})
export type UtilizationAdminActionRequest = z.infer<
  typeof utilizationAdminActionRequestSchema
>

export const utilizationAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: utilizationAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: utilizationAdminStatsSchema.optional(),
})
export type UtilizationAdminActionResponse = z.infer<
  typeof utilizationAdminActionResponseSchema
>
