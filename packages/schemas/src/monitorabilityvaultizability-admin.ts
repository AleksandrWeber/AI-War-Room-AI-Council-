import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const monitorabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type MonitorabilityvaultizabilityAdminDomain = z.infer<typeof monitorabilityvaultizabilityAdminDomainSchema>

export const monitorabilityvaultizabilityAdminRecordSchema = z.object({
  domain: monitorabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MonitorabilityvaultizabilityAdminRecord = z.infer<typeof monitorabilityvaultizabilityAdminRecordSchema>

export const monitorabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  monitorabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type MonitorabilityvaultizabilityAdminStats = z.infer<typeof monitorabilityvaultizabilityAdminStatsSchema>

export const monitorabilityvaultizabilityAdminActionSchema = z.enum(['refresh_monitorabilityvaultizability_summary'])
export type MonitorabilityvaultizabilityAdminAction = z.infer<typeof monitorabilityvaultizabilityAdminActionSchema>

export const monitorabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(monitorabilityvaultizabilityAdminRecordSchema),
  stats: monitorabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(monitorabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MonitorabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof monitorabilityvaultizabilityAdminSummaryResponseSchema
>

export const monitorabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorabilityvaultizabilityAdminActionSchema,
})
export type MonitorabilityvaultizabilityAdminActionRequest = z.infer<
  typeof monitorabilityvaultizabilityAdminActionRequestSchema
>

export const monitorabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: monitorabilityvaultizabilityAdminStatsSchema.optional(),
})
export type MonitorabilityvaultizabilityAdminActionResponse = z.infer<
  typeof monitorabilityvaultizabilityAdminActionResponseSchema
>
