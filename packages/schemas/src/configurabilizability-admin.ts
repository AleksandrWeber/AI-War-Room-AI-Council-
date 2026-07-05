import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const configurabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ConfigurabilizabilityAdminDomain = z.infer<typeof configurabilizabilityAdminDomainSchema>

export const configurabilizabilityAdminRecordSchema = z.object({
  domain: configurabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConfigurabilizabilityAdminRecord = z.infer<typeof configurabilizabilityAdminRecordSchema>

export const configurabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  configurabilizabilityPercent: z.number().min(0).max(100),
})
export type ConfigurabilizabilityAdminStats = z.infer<typeof configurabilizabilityAdminStatsSchema>

export const configurabilizabilityAdminActionSchema = z.enum(['refresh_configurabilizability_summary'])
export type ConfigurabilizabilityAdminAction = z.infer<typeof configurabilizabilityAdminActionSchema>

export const configurabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(configurabilizabilityAdminRecordSchema),
  stats: configurabilizabilityAdminStatsSchema,
  availableActions: z.array(configurabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilizabilityAdminSummaryResponse = z.infer<
  typeof configurabilizabilityAdminSummaryResponseSchema
>

export const configurabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilizabilityAdminActionSchema,
})
export type ConfigurabilizabilityAdminActionRequest = z.infer<
  typeof configurabilizabilityAdminActionRequestSchema
>

export const configurabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: configurabilizabilityAdminStatsSchema.optional(),
})
export type ConfigurabilizabilityAdminActionResponse = z.infer<
  typeof configurabilizabilityAdminActionResponseSchema
>
