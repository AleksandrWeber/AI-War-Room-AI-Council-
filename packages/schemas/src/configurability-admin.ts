import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const configurabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'billing_meter_usage_reports',
])
export type ConfigurabilityAdminDomain = z.infer<typeof configurabilityAdminDomainSchema>

export const configurabilityAdminRecordSchema = z.object({
  domain: configurabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConfigurabilityAdminRecord = z.infer<typeof configurabilityAdminRecordSchema>

export const configurabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  configurabilityPercent: z.number().min(0).max(100),
})
export type ConfigurabilityAdminStats = z.infer<typeof configurabilityAdminStatsSchema>

export const configurabilityAdminActionSchema = z.enum(['refresh_configurability_summary'])
export type ConfigurabilityAdminAction = z.infer<typeof configurabilityAdminActionSchema>

export const configurabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(configurabilityAdminRecordSchema),
  stats: configurabilityAdminStatsSchema,
  availableActions: z.array(configurabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilityAdminSummaryResponse = z.infer<
  typeof configurabilityAdminSummaryResponseSchema
>

export const configurabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilityAdminActionSchema,
})
export type ConfigurabilityAdminActionRequest = z.infer<
  typeof configurabilityAdminActionRequestSchema
>

export const configurabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: configurabilityAdminStatsSchema.optional(),
})
export type ConfigurabilityAdminActionResponse = z.infer<
  typeof configurabilityAdminActionResponseSchema
>
