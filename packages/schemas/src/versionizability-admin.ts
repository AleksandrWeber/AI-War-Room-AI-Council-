import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const versionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type VersionizabilityAdminDomain = z.infer<typeof versionizabilityAdminDomainSchema>

export const versionizabilityAdminRecordSchema = z.object({
  domain: versionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VersionizabilityAdminRecord = z.infer<typeof versionizabilityAdminRecordSchema>

export const versionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  versionizabilityPercent: z.number().min(0).max(100),
})
export type VersionizabilityAdminStats = z.infer<typeof versionizabilityAdminStatsSchema>

export const versionizabilityAdminActionSchema = z.enum(['refresh_versionizability_summary'])
export type VersionizabilityAdminAction = z.infer<typeof versionizabilityAdminActionSchema>

export const versionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(versionizabilityAdminRecordSchema),
  stats: versionizabilityAdminStatsSchema,
  availableActions: z.array(versionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VersionizabilityAdminSummaryResponse = z.infer<
  typeof versionizabilityAdminSummaryResponseSchema
>

export const versionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: versionizabilityAdminActionSchema,
})
export type VersionizabilityAdminActionRequest = z.infer<
  typeof versionizabilityAdminActionRequestSchema
>

export const versionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: versionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: versionizabilityAdminStatsSchema.optional(),
})
export type VersionizabilityAdminActionResponse = z.infer<
  typeof versionizabilityAdminActionResponseSchema
>
