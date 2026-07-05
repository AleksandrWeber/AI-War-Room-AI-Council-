import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const synchronizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type SynchronizabilityAdminDomain = z.infer<typeof synchronizabilityAdminDomainSchema>

export const synchronizabilityAdminRecordSchema = z.object({
  domain: synchronizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SynchronizabilityAdminRecord = z.infer<typeof synchronizabilityAdminRecordSchema>

export const synchronizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  synchronizabilityPercent: z.number().min(0).max(100),
})
export type SynchronizabilityAdminStats = z.infer<typeof synchronizabilityAdminStatsSchema>

export const synchronizabilityAdminActionSchema = z.enum(['refresh_synchronizability_summary'])
export type SynchronizabilityAdminAction = z.infer<typeof synchronizabilityAdminActionSchema>

export const synchronizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(synchronizabilityAdminRecordSchema),
  stats: synchronizabilityAdminStatsSchema,
  availableActions: z.array(synchronizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SynchronizabilityAdminSummaryResponse = z.infer<
  typeof synchronizabilityAdminSummaryResponseSchema
>

export const synchronizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: synchronizabilityAdminActionSchema,
})
export type SynchronizabilityAdminActionRequest = z.infer<
  typeof synchronizabilityAdminActionRequestSchema
>

export const synchronizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: synchronizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: synchronizabilityAdminStatsSchema.optional(),
})
export type SynchronizabilityAdminActionResponse = z.infer<
  typeof synchronizabilityAdminActionResponseSchema
>
