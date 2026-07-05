import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const versioningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type VersioningizabilityAdminDomain = z.infer<typeof versioningizabilityAdminDomainSchema>

export const versioningizabilityAdminRecordSchema = z.object({
  domain: versioningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VersioningizabilityAdminRecord = z.infer<typeof versioningizabilityAdminRecordSchema>

export const versioningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  versioningizabilityPercent: z.number().min(0).max(100),
})
export type VersioningizabilityAdminStats = z.infer<typeof versioningizabilityAdminStatsSchema>

export const versioningizabilityAdminActionSchema = z.enum(['refresh_versioningizability_summary'])
export type VersioningizabilityAdminAction = z.infer<typeof versioningizabilityAdminActionSchema>

export const versioningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(versioningizabilityAdminRecordSchema),
  stats: versioningizabilityAdminStatsSchema,
  availableActions: z.array(versioningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VersioningizabilityAdminSummaryResponse = z.infer<
  typeof versioningizabilityAdminSummaryResponseSchema
>

export const versioningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: versioningizabilityAdminActionSchema,
})
export type VersioningizabilityAdminActionRequest = z.infer<
  typeof versioningizabilityAdminActionRequestSchema
>

export const versioningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: versioningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: versioningizabilityAdminStatsSchema.optional(),
})
export type VersioningizabilityAdminActionResponse = z.infer<
  typeof versioningizabilityAdminActionResponseSchema
>
