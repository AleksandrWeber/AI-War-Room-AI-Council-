import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const confirmabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'workspace_usage_limits',
])
export type ConfirmabilityAdminDomain = z.infer<typeof confirmabilityAdminDomainSchema>

export const confirmabilityAdminRecordSchema = z.object({
  domain: confirmabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConfirmabilityAdminRecord = z.infer<typeof confirmabilityAdminRecordSchema>

export const confirmabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  confirmabilityPercent: z.number().min(0).max(100),
})
export type ConfirmabilityAdminStats = z.infer<typeof confirmabilityAdminStatsSchema>

export const confirmabilityAdminActionSchema = z.enum(['refresh_confirmability_summary'])
export type ConfirmabilityAdminAction = z.infer<typeof confirmabilityAdminActionSchema>

export const confirmabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(confirmabilityAdminRecordSchema),
  stats: confirmabilityAdminStatsSchema,
  availableActions: z.array(confirmabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConfirmabilityAdminSummaryResponse = z.infer<
  typeof confirmabilityAdminSummaryResponseSchema
>

export const confirmabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: confirmabilityAdminActionSchema,
})
export type ConfirmabilityAdminActionRequest = z.infer<
  typeof confirmabilityAdminActionRequestSchema
>

export const confirmabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: confirmabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: confirmabilityAdminStatsSchema.optional(),
})
export type ConfirmabilityAdminActionResponse = z.infer<
  typeof confirmabilityAdminActionResponseSchema
>
