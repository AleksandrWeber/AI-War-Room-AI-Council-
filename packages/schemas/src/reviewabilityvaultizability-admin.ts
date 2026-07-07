import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reviewabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ReviewabilityvaultizabilityAdminDomain = z.infer<typeof reviewabilityvaultizabilityAdminDomainSchema>

export const reviewabilityvaultizabilityAdminRecordSchema = z.object({
  domain: reviewabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReviewabilityvaultizabilityAdminRecord = z.infer<typeof reviewabilityvaultizabilityAdminRecordSchema>

export const reviewabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reviewabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ReviewabilityvaultizabilityAdminStats = z.infer<typeof reviewabilityvaultizabilityAdminStatsSchema>

export const reviewabilityvaultizabilityAdminActionSchema = z.enum(['refresh_reviewabilityvaultizability_summary'])
export type ReviewabilityvaultizabilityAdminAction = z.infer<typeof reviewabilityvaultizabilityAdminActionSchema>

export const reviewabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reviewabilityvaultizabilityAdminRecordSchema),
  stats: reviewabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(reviewabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReviewabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof reviewabilityvaultizabilityAdminSummaryResponseSchema
>

export const reviewabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reviewabilityvaultizabilityAdminActionSchema,
})
export type ReviewabilityvaultizabilityAdminActionRequest = z.infer<
  typeof reviewabilityvaultizabilityAdminActionRequestSchema
>

export const reviewabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reviewabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reviewabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ReviewabilityvaultizabilityAdminActionResponse = z.infer<
  typeof reviewabilityvaultizabilityAdminActionResponseSchema
>
