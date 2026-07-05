import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const generalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type GeneralizabilityAdminDomain = z.infer<typeof generalizabilityAdminDomainSchema>

export const generalizabilityAdminRecordSchema = z.object({
  domain: generalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GeneralizabilityAdminRecord = z.infer<typeof generalizabilityAdminRecordSchema>

export const generalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  generalizabilityPercent: z.number().min(0).max(100),
})
export type GeneralizabilityAdminStats = z.infer<typeof generalizabilityAdminStatsSchema>

export const generalizabilityAdminActionSchema = z.enum(['refresh_generalizability_summary'])
export type GeneralizabilityAdminAction = z.infer<typeof generalizabilityAdminActionSchema>

export const generalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(generalizabilityAdminRecordSchema),
  stats: generalizabilityAdminStatsSchema,
  availableActions: z.array(generalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GeneralizabilityAdminSummaryResponse = z.infer<
  typeof generalizabilityAdminSummaryResponseSchema
>

export const generalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: generalizabilityAdminActionSchema,
})
export type GeneralizabilityAdminActionRequest = z.infer<
  typeof generalizabilityAdminActionRequestSchema
>

export const generalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: generalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: generalizabilityAdminStatsSchema.optional(),
})
export type GeneralizabilityAdminActionResponse = z.infer<
  typeof generalizabilityAdminActionResponseSchema
>
