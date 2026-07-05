import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const joinizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type JoinizabilityAdminDomain = z.infer<typeof joinizabilityAdminDomainSchema>

export const joinizabilityAdminRecordSchema = z.object({
  domain: joinizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type JoinizabilityAdminRecord = z.infer<typeof joinizabilityAdminRecordSchema>

export const joinizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  joinizabilityPercent: z.number().min(0).max(100),
})
export type JoinizabilityAdminStats = z.infer<typeof joinizabilityAdminStatsSchema>

export const joinizabilityAdminActionSchema = z.enum(['refresh_joinizability_summary'])
export type JoinizabilityAdminAction = z.infer<typeof joinizabilityAdminActionSchema>

export const joinizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(joinizabilityAdminRecordSchema),
  stats: joinizabilityAdminStatsSchema,
  availableActions: z.array(joinizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type JoinizabilityAdminSummaryResponse = z.infer<
  typeof joinizabilityAdminSummaryResponseSchema
>

export const joinizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: joinizabilityAdminActionSchema,
})
export type JoinizabilityAdminActionRequest = z.infer<
  typeof joinizabilityAdminActionRequestSchema
>

export const joinizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: joinizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: joinizabilityAdminStatsSchema.optional(),
})
export type JoinizabilityAdminActionResponse = z.infer<
  typeof joinizabilityAdminActionResponseSchema
>
