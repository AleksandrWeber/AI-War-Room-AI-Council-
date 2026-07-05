import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const iconizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type IconizabilityAdminDomain = z.infer<typeof iconizabilityAdminDomainSchema>

export const iconizabilityAdminRecordSchema = z.object({
  domain: iconizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IconizabilityAdminRecord = z.infer<typeof iconizabilityAdminRecordSchema>

export const iconizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  iconizabilityPercent: z.number().min(0).max(100),
})
export type IconizabilityAdminStats = z.infer<typeof iconizabilityAdminStatsSchema>

export const iconizabilityAdminActionSchema = z.enum(['refresh_iconizability_summary'])
export type IconizabilityAdminAction = z.infer<typeof iconizabilityAdminActionSchema>

export const iconizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(iconizabilityAdminRecordSchema),
  stats: iconizabilityAdminStatsSchema,
  availableActions: z.array(iconizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IconizabilityAdminSummaryResponse = z.infer<
  typeof iconizabilityAdminSummaryResponseSchema
>

export const iconizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: iconizabilityAdminActionSchema,
})
export type IconizabilityAdminActionRequest = z.infer<
  typeof iconizabilityAdminActionRequestSchema
>

export const iconizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: iconizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: iconizabilityAdminStatsSchema.optional(),
})
export type IconizabilityAdminActionResponse = z.infer<
  typeof iconizabilityAdminActionResponseSchema
>
