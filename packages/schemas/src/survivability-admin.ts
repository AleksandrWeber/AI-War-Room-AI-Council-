import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const survivabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_meter_usage_reports',
])
export type SurvivabilityAdminDomain = z.infer<typeof survivabilityAdminDomainSchema>

export const survivabilityAdminRecordSchema = z.object({
  domain: survivabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SurvivabilityAdminRecord = z.infer<typeof survivabilityAdminRecordSchema>

export const survivabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  survivabilityPercent: z.number().min(0).max(100),
})
export type SurvivabilityAdminStats = z.infer<typeof survivabilityAdminStatsSchema>

export const survivabilityAdminActionSchema = z.enum(['refresh_survivability_summary'])
export type SurvivabilityAdminAction = z.infer<typeof survivabilityAdminActionSchema>

export const survivabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(survivabilityAdminRecordSchema),
  stats: survivabilityAdminStatsSchema,
  availableActions: z.array(survivabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SurvivabilityAdminSummaryResponse = z.infer<
  typeof survivabilityAdminSummaryResponseSchema
>

export const survivabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: survivabilityAdminActionSchema,
})
export type SurvivabilityAdminActionRequest = z.infer<
  typeof survivabilityAdminActionRequestSchema
>

export const survivabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: survivabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: survivabilityAdminStatsSchema.optional(),
})
export type SurvivabilityAdminActionResponse = z.infer<
  typeof survivabilityAdminActionResponseSchema
>
