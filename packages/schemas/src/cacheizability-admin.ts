import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const cacheizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type CacheizabilityAdminDomain = z.infer<typeof cacheizabilityAdminDomainSchema>

export const cacheizabilityAdminRecordSchema = z.object({
  domain: cacheizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CacheizabilityAdminRecord = z.infer<typeof cacheizabilityAdminRecordSchema>

export const cacheizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  cacheizabilityPercent: z.number().min(0).max(100),
})
export type CacheizabilityAdminStats = z.infer<typeof cacheizabilityAdminStatsSchema>

export const cacheizabilityAdminActionSchema = z.enum(['refresh_cacheizability_summary'])
export type CacheizabilityAdminAction = z.infer<typeof cacheizabilityAdminActionSchema>

export const cacheizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(cacheizabilityAdminRecordSchema),
  stats: cacheizabilityAdminStatsSchema,
  availableActions: z.array(cacheizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CacheizabilityAdminSummaryResponse = z.infer<
  typeof cacheizabilityAdminSummaryResponseSchema
>

export const cacheizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cacheizabilityAdminActionSchema,
})
export type CacheizabilityAdminActionRequest = z.infer<
  typeof cacheizabilityAdminActionRequestSchema
>

export const cacheizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cacheizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: cacheizabilityAdminStatsSchema.optional(),
})
export type CacheizabilityAdminActionResponse = z.infer<
  typeof cacheizabilityAdminActionResponseSchema
>
