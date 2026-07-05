import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const measurabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type MeasurabilityAdminDomain = z.infer<typeof measurabilityAdminDomainSchema>

export const measurabilityAdminRecordSchema = z.object({
  domain: measurabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MeasurabilityAdminRecord = z.infer<typeof measurabilityAdminRecordSchema>

export const measurabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  measurabilityPercent: z.number().min(0).max(100),
})
export type MeasurabilityAdminStats = z.infer<typeof measurabilityAdminStatsSchema>

export const measurabilityAdminActionSchema = z.enum(['refresh_measurability_summary'])
export type MeasurabilityAdminAction = z.infer<typeof measurabilityAdminActionSchema>

export const measurabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(measurabilityAdminRecordSchema),
  stats: measurabilityAdminStatsSchema,
  availableActions: z.array(measurabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MeasurabilityAdminSummaryResponse = z.infer<
  typeof measurabilityAdminSummaryResponseSchema
>

export const measurabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: measurabilityAdminActionSchema,
})
export type MeasurabilityAdminActionRequest = z.infer<
  typeof measurabilityAdminActionRequestSchema
>

export const measurabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: measurabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: measurabilityAdminStatsSchema.optional(),
})
export type MeasurabilityAdminActionResponse = z.infer<
  typeof measurabilityAdminActionResponseSchema
>
