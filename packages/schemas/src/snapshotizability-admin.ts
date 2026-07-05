import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const snapshotizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type SnapshotizabilityAdminDomain = z.infer<typeof snapshotizabilityAdminDomainSchema>

export const snapshotizabilityAdminRecordSchema = z.object({
  domain: snapshotizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SnapshotizabilityAdminRecord = z.infer<typeof snapshotizabilityAdminRecordSchema>

export const snapshotizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  snapshotizabilityPercent: z.number().min(0).max(100),
})
export type SnapshotizabilityAdminStats = z.infer<typeof snapshotizabilityAdminStatsSchema>

export const snapshotizabilityAdminActionSchema = z.enum(['refresh_snapshotizability_summary'])
export type SnapshotizabilityAdminAction = z.infer<typeof snapshotizabilityAdminActionSchema>

export const snapshotizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(snapshotizabilityAdminRecordSchema),
  stats: snapshotizabilityAdminStatsSchema,
  availableActions: z.array(snapshotizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SnapshotizabilityAdminSummaryResponse = z.infer<
  typeof snapshotizabilityAdminSummaryResponseSchema
>

export const snapshotizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: snapshotizabilityAdminActionSchema,
})
export type SnapshotizabilityAdminActionRequest = z.infer<
  typeof snapshotizabilityAdminActionRequestSchema
>

export const snapshotizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: snapshotizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: snapshotizabilityAdminStatsSchema.optional(),
})
export type SnapshotizabilityAdminActionResponse = z.infer<
  typeof snapshotizabilityAdminActionResponseSchema
>
