import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const upgradizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type UpgradizabilityAdminDomain = z.infer<typeof upgradizabilityAdminDomainSchema>

export const upgradizabilityAdminRecordSchema = z.object({
  domain: upgradizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type UpgradizabilityAdminRecord = z.infer<typeof upgradizabilityAdminRecordSchema>

export const upgradizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  upgradizabilityPercent: z.number().min(0).max(100),
})
export type UpgradizabilityAdminStats = z.infer<typeof upgradizabilityAdminStatsSchema>

export const upgradizabilityAdminActionSchema = z.enum(['refresh_upgradizability_summary'])
export type UpgradizabilityAdminAction = z.infer<typeof upgradizabilityAdminActionSchema>

export const upgradizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(upgradizabilityAdminRecordSchema),
  stats: upgradizabilityAdminStatsSchema,
  availableActions: z.array(upgradizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UpgradizabilityAdminSummaryResponse = z.infer<
  typeof upgradizabilityAdminSummaryResponseSchema
>

export const upgradizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: upgradizabilityAdminActionSchema,
})
export type UpgradizabilityAdminActionRequest = z.infer<
  typeof upgradizabilityAdminActionRequestSchema
>

export const upgradizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: upgradizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: upgradizabilityAdminStatsSchema.optional(),
})
export type UpgradizabilityAdminActionResponse = z.infer<
  typeof upgradizabilityAdminActionResponseSchema
>
