import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const historizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type HistorizabilityAdminDomain = z.infer<typeof historizabilityAdminDomainSchema>

export const historizabilityAdminRecordSchema = z.object({
  domain: historizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HistorizabilityAdminRecord = z.infer<typeof historizabilityAdminRecordSchema>

export const historizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  historizabilityPercent: z.number().min(0).max(100),
})
export type HistorizabilityAdminStats = z.infer<typeof historizabilityAdminStatsSchema>

export const historizabilityAdminActionSchema = z.enum(['refresh_historizability_summary'])
export type HistorizabilityAdminAction = z.infer<typeof historizabilityAdminActionSchema>

export const historizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(historizabilityAdminRecordSchema),
  stats: historizabilityAdminStatsSchema,
  availableActions: z.array(historizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HistorizabilityAdminSummaryResponse = z.infer<
  typeof historizabilityAdminSummaryResponseSchema
>

export const historizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: historizabilityAdminActionSchema,
})
export type HistorizabilityAdminActionRequest = z.infer<
  typeof historizabilityAdminActionRequestSchema
>

export const historizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: historizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: historizabilityAdminStatsSchema.optional(),
})
export type HistorizabilityAdminActionResponse = z.infer<
  typeof historizabilityAdminActionResponseSchema
>
