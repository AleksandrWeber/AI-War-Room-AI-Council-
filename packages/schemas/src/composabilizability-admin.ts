import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const composabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ComposabilizabilityAdminDomain = z.infer<typeof composabilizabilityAdminDomainSchema>

export const composabilizabilityAdminRecordSchema = z.object({
  domain: composabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComposabilizabilityAdminRecord = z.infer<typeof composabilizabilityAdminRecordSchema>

export const composabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  composabilizabilityPercent: z.number().min(0).max(100),
})
export type ComposabilizabilityAdminStats = z.infer<typeof composabilizabilityAdminStatsSchema>

export const composabilizabilityAdminActionSchema = z.enum(['refresh_composabilizability_summary'])
export type ComposabilizabilityAdminAction = z.infer<typeof composabilizabilityAdminActionSchema>

export const composabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(composabilizabilityAdminRecordSchema),
  stats: composabilizabilityAdminStatsSchema,
  availableActions: z.array(composabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComposabilizabilityAdminSummaryResponse = z.infer<
  typeof composabilizabilityAdminSummaryResponseSchema
>

export const composabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilizabilityAdminActionSchema,
})
export type ComposabilizabilityAdminActionRequest = z.infer<
  typeof composabilizabilityAdminActionRequestSchema
>

export const composabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: composabilizabilityAdminStatsSchema.optional(),
})
export type ComposabilizabilityAdminActionResponse = z.infer<
  typeof composabilizabilityAdminActionResponseSchema
>
