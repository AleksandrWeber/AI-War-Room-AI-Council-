import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const detectabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_notifications',
])
export type DetectabilityAdminDomain = z.infer<typeof detectabilityAdminDomainSchema>

export const detectabilityAdminRecordSchema = z.object({
  domain: detectabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DetectabilityAdminRecord = z.infer<typeof detectabilityAdminRecordSchema>

export const detectabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  detectabilityPercent: z.number().min(0).max(100),
})
export type DetectabilityAdminStats = z.infer<typeof detectabilityAdminStatsSchema>

export const detectabilityAdminActionSchema = z.enum(['refresh_detectability_summary'])
export type DetectabilityAdminAction = z.infer<typeof detectabilityAdminActionSchema>

export const detectabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(detectabilityAdminRecordSchema),
  stats: detectabilityAdminStatsSchema,
  availableActions: z.array(detectabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DetectabilityAdminSummaryResponse = z.infer<
  typeof detectabilityAdminSummaryResponseSchema
>

export const detectabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: detectabilityAdminActionSchema,
})
export type DetectabilityAdminActionRequest = z.infer<
  typeof detectabilityAdminActionRequestSchema
>

export const detectabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: detectabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: detectabilityAdminStatsSchema.optional(),
})
export type DetectabilityAdminActionResponse = z.infer<
  typeof detectabilityAdminActionResponseSchema
>
