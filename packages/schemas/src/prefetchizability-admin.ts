import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const prefetchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type PrefetchizabilityAdminDomain = z.infer<typeof prefetchizabilityAdminDomainSchema>

export const prefetchizabilityAdminRecordSchema = z.object({
  domain: prefetchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PrefetchizabilityAdminRecord = z.infer<typeof prefetchizabilityAdminRecordSchema>

export const prefetchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  prefetchizabilityPercent: z.number().min(0).max(100),
})
export type PrefetchizabilityAdminStats = z.infer<typeof prefetchizabilityAdminStatsSchema>

export const prefetchizabilityAdminActionSchema = z.enum(['refresh_prefetchizability_summary'])
export type PrefetchizabilityAdminAction = z.infer<typeof prefetchizabilityAdminActionSchema>

export const prefetchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(prefetchizabilityAdminRecordSchema),
  stats: prefetchizabilityAdminStatsSchema,
  availableActions: z.array(prefetchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PrefetchizabilityAdminSummaryResponse = z.infer<
  typeof prefetchizabilityAdminSummaryResponseSchema
>

export const prefetchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: prefetchizabilityAdminActionSchema,
})
export type PrefetchizabilityAdminActionRequest = z.infer<
  typeof prefetchizabilityAdminActionRequestSchema
>

export const prefetchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: prefetchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: prefetchizabilityAdminStatsSchema.optional(),
})
export type PrefetchizabilityAdminActionResponse = z.infer<
  typeof prefetchizabilityAdminActionResponseSchema
>
