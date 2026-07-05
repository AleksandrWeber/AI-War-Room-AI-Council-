import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const accessibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AccessibilityAdminDomain = z.infer<typeof accessibilityAdminDomainSchema>

export const accessibilityAdminRecordSchema = z.object({
  domain: accessibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AccessibilityAdminRecord = z.infer<typeof accessibilityAdminRecordSchema>

export const accessibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  accessibilityPercent: z.number().min(0).max(100),
})
export type AccessibilityAdminStats = z.infer<typeof accessibilityAdminStatsSchema>

export const accessibilityAdminActionSchema = z.enum(['refresh_accessibility_summary'])
export type AccessibilityAdminAction = z.infer<typeof accessibilityAdminActionSchema>

export const accessibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(accessibilityAdminRecordSchema),
  stats: accessibilityAdminStatsSchema,
  availableActions: z.array(accessibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AccessibilityAdminSummaryResponse = z.infer<
  typeof accessibilityAdminSummaryResponseSchema
>

export const accessibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accessibilityAdminActionSchema,
})
export type AccessibilityAdminActionRequest = z.infer<
  typeof accessibilityAdminActionRequestSchema
>

export const accessibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accessibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: accessibilityAdminStatsSchema.optional(),
})
export type AccessibilityAdminActionResponse = z.infer<
  typeof accessibilityAdminActionResponseSchema
>
