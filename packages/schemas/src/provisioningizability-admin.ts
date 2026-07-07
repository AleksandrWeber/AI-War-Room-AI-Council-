import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const provisioningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ProvisioningizabilityAdminDomain = z.infer<typeof provisioningizabilityAdminDomainSchema>

export const provisioningizabilityAdminRecordSchema = z.object({
  domain: provisioningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProvisioningizabilityAdminRecord = z.infer<typeof provisioningizabilityAdminRecordSchema>

export const provisioningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  provisioningizabilityPercent: z.number().min(0).max(100),
})
export type ProvisioningizabilityAdminStats = z.infer<typeof provisioningizabilityAdminStatsSchema>

export const provisioningizabilityAdminActionSchema = z.enum(['refresh_provisioningizability_summary'])
export type ProvisioningizabilityAdminAction = z.infer<typeof provisioningizabilityAdminActionSchema>

export const provisioningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(provisioningizabilityAdminRecordSchema),
  stats: provisioningizabilityAdminStatsSchema,
  availableActions: z.array(provisioningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProvisioningizabilityAdminSummaryResponse = z.infer<
  typeof provisioningizabilityAdminSummaryResponseSchema
>

export const provisioningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provisioningizabilityAdminActionSchema,
})
export type ProvisioningizabilityAdminActionRequest = z.infer<
  typeof provisioningizabilityAdminActionRequestSchema
>

export const provisioningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provisioningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: provisioningizabilityAdminStatsSchema.optional(),
})
export type ProvisioningizabilityAdminActionResponse = z.infer<
  typeof provisioningizabilityAdminActionResponseSchema
>
