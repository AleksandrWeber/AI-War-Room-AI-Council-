import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const queueizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type QueueizabilityAdminDomain = z.infer<typeof queueizabilityAdminDomainSchema>

export const queueizabilityAdminRecordSchema = z.object({
  domain: queueizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type QueueizabilityAdminRecord = z.infer<typeof queueizabilityAdminRecordSchema>

export const queueizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  queueizabilityPercent: z.number().min(0).max(100),
})
export type QueueizabilityAdminStats = z.infer<typeof queueizabilityAdminStatsSchema>

export const queueizabilityAdminActionSchema = z.enum(['refresh_queueizability_summary'])
export type QueueizabilityAdminAction = z.infer<typeof queueizabilityAdminActionSchema>

export const queueizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(queueizabilityAdminRecordSchema),
  stats: queueizabilityAdminStatsSchema,
  availableActions: z.array(queueizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type QueueizabilityAdminSummaryResponse = z.infer<
  typeof queueizabilityAdminSummaryResponseSchema
>

export const queueizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: queueizabilityAdminActionSchema,
})
export type QueueizabilityAdminActionRequest = z.infer<
  typeof queueizabilityAdminActionRequestSchema
>

export const queueizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: queueizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: queueizabilityAdminStatsSchema.optional(),
})
export type QueueizabilityAdminActionResponse = z.infer<
  typeof queueizabilityAdminActionResponseSchema
>
