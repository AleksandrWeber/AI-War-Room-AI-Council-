import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const locatabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'usage_events',
])
export type LocatabilityAdminDomain = z.infer<typeof locatabilityAdminDomainSchema>

export const locatabilityAdminRecordSchema = z.object({
  domain: locatabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LocatabilityAdminRecord = z.infer<typeof locatabilityAdminRecordSchema>

export const locatabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  locatabilityPercent: z.number().min(0).max(100),
})
export type LocatabilityAdminStats = z.infer<typeof locatabilityAdminStatsSchema>

export const locatabilityAdminActionSchema = z.enum(['refresh_locatability_summary'])
export type LocatabilityAdminAction = z.infer<typeof locatabilityAdminActionSchema>

export const locatabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(locatabilityAdminRecordSchema),
  stats: locatabilityAdminStatsSchema,
  availableActions: z.array(locatabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LocatabilityAdminSummaryResponse = z.infer<
  typeof locatabilityAdminSummaryResponseSchema
>

export const locatabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: locatabilityAdminActionSchema,
})
export type LocatabilityAdminActionRequest = z.infer<
  typeof locatabilityAdminActionRequestSchema
>

export const locatabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: locatabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: locatabilityAdminStatsSchema.optional(),
})
export type LocatabilityAdminActionResponse = z.infer<
  typeof locatabilityAdminActionResponseSchema
>
