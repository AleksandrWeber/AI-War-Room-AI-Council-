import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const segregationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type SegregationizabilityAdminDomain = z.infer<typeof segregationizabilityAdminDomainSchema>

export const segregationizabilityAdminRecordSchema = z.object({
  domain: segregationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SegregationizabilityAdminRecord = z.infer<typeof segregationizabilityAdminRecordSchema>

export const segregationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  segregationizabilityPercent: z.number().min(0).max(100),
})
export type SegregationizabilityAdminStats = z.infer<typeof segregationizabilityAdminStatsSchema>

export const segregationizabilityAdminActionSchema = z.enum(['refresh_segregationizability_summary'])
export type SegregationizabilityAdminAction = z.infer<typeof segregationizabilityAdminActionSchema>

export const segregationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(segregationizabilityAdminRecordSchema),
  stats: segregationizabilityAdminStatsSchema,
  availableActions: z.array(segregationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SegregationizabilityAdminSummaryResponse = z.infer<
  typeof segregationizabilityAdminSummaryResponseSchema
>

export const segregationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: segregationizabilityAdminActionSchema,
})
export type SegregationizabilityAdminActionRequest = z.infer<
  typeof segregationizabilityAdminActionRequestSchema
>

export const segregationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: segregationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: segregationizabilityAdminStatsSchema.optional(),
})
export type SegregationizabilityAdminActionResponse = z.infer<
  typeof segregationizabilityAdminActionResponseSchema
>
