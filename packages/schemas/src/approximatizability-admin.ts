import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const approximatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ApproximatizabilityAdminDomain = z.infer<typeof approximatizabilityAdminDomainSchema>

export const approximatizabilityAdminRecordSchema = z.object({
  domain: approximatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ApproximatizabilityAdminRecord = z.infer<typeof approximatizabilityAdminRecordSchema>

export const approximatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  approximatizabilityPercent: z.number().min(0).max(100),
})
export type ApproximatizabilityAdminStats = z.infer<typeof approximatizabilityAdminStatsSchema>

export const approximatizabilityAdminActionSchema = z.enum(['refresh_approximatizability_summary'])
export type ApproximatizabilityAdminAction = z.infer<typeof approximatizabilityAdminActionSchema>

export const approximatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(approximatizabilityAdminRecordSchema),
  stats: approximatizabilityAdminStatsSchema,
  availableActions: z.array(approximatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ApproximatizabilityAdminSummaryResponse = z.infer<
  typeof approximatizabilityAdminSummaryResponseSchema
>

export const approximatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: approximatizabilityAdminActionSchema,
})
export type ApproximatizabilityAdminActionRequest = z.infer<
  typeof approximatizabilityAdminActionRequestSchema
>

export const approximatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: approximatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: approximatizabilityAdminStatsSchema.optional(),
})
export type ApproximatizabilityAdminActionResponse = z.infer<
  typeof approximatizabilityAdminActionResponseSchema
>
