import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const asynchronizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AsynchronizabilityAdminDomain = z.infer<typeof asynchronizabilityAdminDomainSchema>

export const asynchronizabilityAdminRecordSchema = z.object({
  domain: asynchronizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AsynchronizabilityAdminRecord = z.infer<typeof asynchronizabilityAdminRecordSchema>

export const asynchronizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  asynchronizabilityPercent: z.number().min(0).max(100),
})
export type AsynchronizabilityAdminStats = z.infer<typeof asynchronizabilityAdminStatsSchema>

export const asynchronizabilityAdminActionSchema = z.enum(['refresh_asynchronizability_summary'])
export type AsynchronizabilityAdminAction = z.infer<typeof asynchronizabilityAdminActionSchema>

export const asynchronizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(asynchronizabilityAdminRecordSchema),
  stats: asynchronizabilityAdminStatsSchema,
  availableActions: z.array(asynchronizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AsynchronizabilityAdminSummaryResponse = z.infer<
  typeof asynchronizabilityAdminSummaryResponseSchema
>

export const asynchronizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: asynchronizabilityAdminActionSchema,
})
export type AsynchronizabilityAdminActionRequest = z.infer<
  typeof asynchronizabilityAdminActionRequestSchema
>

export const asynchronizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: asynchronizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: asynchronizabilityAdminStatsSchema.optional(),
})
export type AsynchronizabilityAdminActionResponse = z.infer<
  typeof asynchronizabilityAdminActionResponseSchema
>
