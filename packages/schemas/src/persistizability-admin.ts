import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const persistizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type PersistizabilityAdminDomain = z.infer<typeof persistizabilityAdminDomainSchema>

export const persistizabilityAdminRecordSchema = z.object({
  domain: persistizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PersistizabilityAdminRecord = z.infer<typeof persistizabilityAdminRecordSchema>

export const persistizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  persistizabilityPercent: z.number().min(0).max(100),
})
export type PersistizabilityAdminStats = z.infer<typeof persistizabilityAdminStatsSchema>

export const persistizabilityAdminActionSchema = z.enum(['refresh_persistizability_summary'])
export type PersistizabilityAdminAction = z.infer<typeof persistizabilityAdminActionSchema>

export const persistizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(persistizabilityAdminRecordSchema),
  stats: persistizabilityAdminStatsSchema,
  availableActions: z.array(persistizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PersistizabilityAdminSummaryResponse = z.infer<
  typeof persistizabilityAdminSummaryResponseSchema
>

export const persistizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: persistizabilityAdminActionSchema,
})
export type PersistizabilityAdminActionRequest = z.infer<
  typeof persistizabilityAdminActionRequestSchema
>

export const persistizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: persistizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: persistizabilityAdminStatsSchema.optional(),
})
export type PersistizabilityAdminActionResponse = z.infer<
  typeof persistizabilityAdminActionResponseSchema
>
