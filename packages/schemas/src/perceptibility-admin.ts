import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const perceptibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_meter_usage_reports',
])
export type PerceptibilityAdminDomain = z.infer<typeof perceptibilityAdminDomainSchema>

export const perceptibilityAdminRecordSchema = z.object({
  domain: perceptibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PerceptibilityAdminRecord = z.infer<typeof perceptibilityAdminRecordSchema>

export const perceptibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  perceptibilityPercent: z.number().min(0).max(100),
})
export type PerceptibilityAdminStats = z.infer<typeof perceptibilityAdminStatsSchema>

export const perceptibilityAdminActionSchema = z.enum(['refresh_perceptibility_summary'])
export type PerceptibilityAdminAction = z.infer<typeof perceptibilityAdminActionSchema>

export const perceptibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(perceptibilityAdminRecordSchema),
  stats: perceptibilityAdminStatsSchema,
  availableActions: z.array(perceptibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PerceptibilityAdminSummaryResponse = z.infer<
  typeof perceptibilityAdminSummaryResponseSchema
>

export const perceptibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: perceptibilityAdminActionSchema,
})
export type PerceptibilityAdminActionRequest = z.infer<
  typeof perceptibilityAdminActionRequestSchema
>

export const perceptibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: perceptibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: perceptibilityAdminStatsSchema.optional(),
})
export type PerceptibilityAdminActionResponse = z.infer<
  typeof perceptibilityAdminActionResponseSchema
>
