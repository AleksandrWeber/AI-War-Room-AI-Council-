import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reviewabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'billing_invoices',
])
export type ReviewabilityAdminDomain = z.infer<typeof reviewabilityAdminDomainSchema>

export const reviewabilityAdminRecordSchema = z.object({
  domain: reviewabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReviewabilityAdminRecord = z.infer<typeof reviewabilityAdminRecordSchema>

export const reviewabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reviewabilityPercent: z.number().min(0).max(100),
})
export type ReviewabilityAdminStats = z.infer<typeof reviewabilityAdminStatsSchema>

export const reviewabilityAdminActionSchema = z.enum(['refresh_reviewability_summary'])
export type ReviewabilityAdminAction = z.infer<typeof reviewabilityAdminActionSchema>

export const reviewabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reviewabilityAdminRecordSchema),
  stats: reviewabilityAdminStatsSchema,
  availableActions: z.array(reviewabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReviewabilityAdminSummaryResponse = z.infer<
  typeof reviewabilityAdminSummaryResponseSchema
>

export const reviewabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reviewabilityAdminActionSchema,
})
export type ReviewabilityAdminActionRequest = z.infer<
  typeof reviewabilityAdminActionRequestSchema
>

export const reviewabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reviewabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reviewabilityAdminStatsSchema.optional(),
})
export type ReviewabilityAdminActionResponse = z.infer<
  typeof reviewabilityAdminActionResponseSchema
>
