import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const presentabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_meter_usage_reports',
])
export type PresentabilityAdminDomain = z.infer<typeof presentabilityAdminDomainSchema>

export const presentabilityAdminRecordSchema = z.object({
  domain: presentabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PresentabilityAdminRecord = z.infer<typeof presentabilityAdminRecordSchema>

export const presentabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  presentabilityPercent: z.number().min(0).max(100),
})
export type PresentabilityAdminStats = z.infer<typeof presentabilityAdminStatsSchema>

export const presentabilityAdminActionSchema = z.enum(['refresh_presentability_summary'])
export type PresentabilityAdminAction = z.infer<typeof presentabilityAdminActionSchema>

export const presentabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(presentabilityAdminRecordSchema),
  stats: presentabilityAdminStatsSchema,
  availableActions: z.array(presentabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PresentabilityAdminSummaryResponse = z.infer<
  typeof presentabilityAdminSummaryResponseSchema
>

export const presentabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: presentabilityAdminActionSchema,
})
export type PresentabilityAdminActionRequest = z.infer<
  typeof presentabilityAdminActionRequestSchema
>

export const presentabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: presentabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: presentabilityAdminStatsSchema.optional(),
})
export type PresentabilityAdminActionResponse = z.infer<
  typeof presentabilityAdminActionResponseSchema
>
