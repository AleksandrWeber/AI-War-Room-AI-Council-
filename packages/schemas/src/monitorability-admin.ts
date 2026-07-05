import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const monitorabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_records',
])
export type MonitorabilityAdminDomain = z.infer<typeof monitorabilityAdminDomainSchema>

export const monitorabilityAdminRecordSchema = z.object({
  domain: monitorabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MonitorabilityAdminRecord = z.infer<typeof monitorabilityAdminRecordSchema>

export const monitorabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  monitorabilityPercent: z.number().min(0).max(100),
})
export type MonitorabilityAdminStats = z.infer<typeof monitorabilityAdminStatsSchema>

export const monitorabilityAdminActionSchema = z.enum(['refresh_monitorability_summary'])
export type MonitorabilityAdminAction = z.infer<typeof monitorabilityAdminActionSchema>

export const monitorabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(monitorabilityAdminRecordSchema),
  stats: monitorabilityAdminStatsSchema,
  availableActions: z.array(monitorabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MonitorabilityAdminSummaryResponse = z.infer<
  typeof monitorabilityAdminSummaryResponseSchema
>

export const monitorabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorabilityAdminActionSchema,
})
export type MonitorabilityAdminActionRequest = z.infer<
  typeof monitorabilityAdminActionRequestSchema
>

export const monitorabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: monitorabilityAdminStatsSchema.optional(),
})
export type MonitorabilityAdminActionResponse = z.infer<
  typeof monitorabilityAdminActionResponseSchema
>
