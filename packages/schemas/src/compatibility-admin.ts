import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compatibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'billing_records',
])
export type CompatibilityAdminDomain = z.infer<typeof compatibilityAdminDomainSchema>

export const compatibilityAdminRecordSchema = z.object({
  domain: compatibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompatibilityAdminRecord = z.infer<typeof compatibilityAdminRecordSchema>

export const compatibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compatibilityPercent: z.number().min(0).max(100),
})
export type CompatibilityAdminStats = z.infer<typeof compatibilityAdminStatsSchema>

export const compatibilityAdminActionSchema = z.enum(['refresh_compatibility_summary'])
export type CompatibilityAdminAction = z.infer<typeof compatibilityAdminActionSchema>

export const compatibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compatibilityAdminRecordSchema),
  stats: compatibilityAdminStatsSchema,
  availableActions: z.array(compatibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompatibilityAdminSummaryResponse = z.infer<
  typeof compatibilityAdminSummaryResponseSchema
>

export const compatibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilityAdminActionSchema,
})
export type CompatibilityAdminActionRequest = z.infer<
  typeof compatibilityAdminActionRequestSchema
>

export const compatibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compatibilityAdminStatsSchema.optional(),
})
export type CompatibilityAdminActionResponse = z.infer<
  typeof compatibilityAdminActionResponseSchema
>
