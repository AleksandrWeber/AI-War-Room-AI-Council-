import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const replicationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ReplicationizabilityAdminDomain = z.infer<typeof replicationizabilityAdminDomainSchema>

export const replicationizabilityAdminRecordSchema = z.object({
  domain: replicationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReplicationizabilityAdminRecord = z.infer<typeof replicationizabilityAdminRecordSchema>

export const replicationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  replicationizabilityPercent: z.number().min(0).max(100),
})
export type ReplicationizabilityAdminStats = z.infer<typeof replicationizabilityAdminStatsSchema>

export const replicationizabilityAdminActionSchema = z.enum(['refresh_replicationizability_summary'])
export type ReplicationizabilityAdminAction = z.infer<typeof replicationizabilityAdminActionSchema>

export const replicationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(replicationizabilityAdminRecordSchema),
  stats: replicationizabilityAdminStatsSchema,
  availableActions: z.array(replicationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReplicationizabilityAdminSummaryResponse = z.infer<
  typeof replicationizabilityAdminSummaryResponseSchema
>

export const replicationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: replicationizabilityAdminActionSchema,
})
export type ReplicationizabilityAdminActionRequest = z.infer<
  typeof replicationizabilityAdminActionRequestSchema
>

export const replicationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: replicationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: replicationizabilityAdminStatsSchema.optional(),
})
export type ReplicationizabilityAdminActionResponse = z.infer<
  typeof replicationizabilityAdminActionResponseSchema
>
