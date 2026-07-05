import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const queryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type QueryizabilityAdminDomain = z.infer<typeof queryizabilityAdminDomainSchema>

export const queryizabilityAdminRecordSchema = z.object({
  domain: queryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type QueryizabilityAdminRecord = z.infer<typeof queryizabilityAdminRecordSchema>

export const queryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  queryizabilityPercent: z.number().min(0).max(100),
})
export type QueryizabilityAdminStats = z.infer<typeof queryizabilityAdminStatsSchema>

export const queryizabilityAdminActionSchema = z.enum(['refresh_queryizability_summary'])
export type QueryizabilityAdminAction = z.infer<typeof queryizabilityAdminActionSchema>

export const queryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(queryizabilityAdminRecordSchema),
  stats: queryizabilityAdminStatsSchema,
  availableActions: z.array(queryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type QueryizabilityAdminSummaryResponse = z.infer<
  typeof queryizabilityAdminSummaryResponseSchema
>

export const queryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: queryizabilityAdminActionSchema,
})
export type QueryizabilityAdminActionRequest = z.infer<
  typeof queryizabilityAdminActionRequestSchema
>

export const queryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: queryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: queryizabilityAdminStatsSchema.optional(),
})
export type QueryizabilityAdminActionResponse = z.infer<
  typeof queryizabilityAdminActionResponseSchema
>
