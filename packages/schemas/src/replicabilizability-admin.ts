import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const replicabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type ReplicabilizabilityAdminDomain = z.infer<typeof replicabilizabilityAdminDomainSchema>

export const replicabilizabilityAdminRecordSchema = z.object({
  domain: replicabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReplicabilizabilityAdminRecord = z.infer<typeof replicabilizabilityAdminRecordSchema>

export const replicabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  replicabilizabilityPercent: z.number().min(0).max(100),
})
export type ReplicabilizabilityAdminStats = z.infer<typeof replicabilizabilityAdminStatsSchema>

export const replicabilizabilityAdminActionSchema = z.enum(['refresh_replicabilizability_summary'])
export type ReplicabilizabilityAdminAction = z.infer<typeof replicabilizabilityAdminActionSchema>

export const replicabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(replicabilizabilityAdminRecordSchema),
  stats: replicabilizabilityAdminStatsSchema,
  availableActions: z.array(replicabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReplicabilizabilityAdminSummaryResponse = z.infer<
  typeof replicabilizabilityAdminSummaryResponseSchema
>

export const replicabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: replicabilizabilityAdminActionSchema,
})
export type ReplicabilizabilityAdminActionRequest = z.infer<
  typeof replicabilizabilityAdminActionRequestSchema
>

export const replicabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: replicabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: replicabilizabilityAdminStatsSchema.optional(),
})
export type ReplicabilizabilityAdminActionResponse = z.infer<
  typeof replicabilizabilityAdminActionResponseSchema
>
