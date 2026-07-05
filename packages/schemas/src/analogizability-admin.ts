import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const analogizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_meter_usage_reports',
])
export type AnalogizabilityAdminDomain = z.infer<typeof analogizabilityAdminDomainSchema>

export const analogizabilityAdminRecordSchema = z.object({
  domain: analogizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AnalogizabilityAdminRecord = z.infer<typeof analogizabilityAdminRecordSchema>

export const analogizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  analogizabilityPercent: z.number().min(0).max(100),
})
export type AnalogizabilityAdminStats = z.infer<typeof analogizabilityAdminStatsSchema>

export const analogizabilityAdminActionSchema = z.enum(['refresh_analogizability_summary'])
export type AnalogizabilityAdminAction = z.infer<typeof analogizabilityAdminActionSchema>

export const analogizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(analogizabilityAdminRecordSchema),
  stats: analogizabilityAdminStatsSchema,
  availableActions: z.array(analogizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AnalogizabilityAdminSummaryResponse = z.infer<
  typeof analogizabilityAdminSummaryResponseSchema
>

export const analogizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: analogizabilityAdminActionSchema,
})
export type AnalogizabilityAdminActionRequest = z.infer<
  typeof analogizabilityAdminActionRequestSchema
>

export const analogizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: analogizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: analogizabilityAdminStatsSchema.optional(),
})
export type AnalogizabilityAdminActionResponse = z.infer<
  typeof analogizabilityAdminActionResponseSchema
>
