import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const walizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type WalizabilityAdminDomain = z.infer<typeof walizabilityAdminDomainSchema>

export const walizabilityAdminRecordSchema = z.object({
  domain: walizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WalizabilityAdminRecord = z.infer<typeof walizabilityAdminRecordSchema>

export const walizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  walizabilityPercent: z.number().min(0).max(100),
})
export type WalizabilityAdminStats = z.infer<typeof walizabilityAdminStatsSchema>

export const walizabilityAdminActionSchema = z.enum(['refresh_walizability_summary'])
export type WalizabilityAdminAction = z.infer<typeof walizabilityAdminActionSchema>

export const walizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(walizabilityAdminRecordSchema),
  stats: walizabilityAdminStatsSchema,
  availableActions: z.array(walizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WalizabilityAdminSummaryResponse = z.infer<
  typeof walizabilityAdminSummaryResponseSchema
>

export const walizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: walizabilityAdminActionSchema,
})
export type WalizabilityAdminActionRequest = z.infer<
  typeof walizabilityAdminActionRequestSchema
>

export const walizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: walizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: walizabilityAdminStatsSchema.optional(),
})
export type WalizabilityAdminActionResponse = z.infer<
  typeof walizabilityAdminActionResponseSchema
>
