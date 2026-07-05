import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assessabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type AssessabilityAdminDomain = z.infer<typeof assessabilityAdminDomainSchema>

export const assessabilityAdminRecordSchema = z.object({
  domain: assessabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssessabilityAdminRecord = z.infer<typeof assessabilityAdminRecordSchema>

export const assessabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assessabilityPercent: z.number().min(0).max(100),
})
export type AssessabilityAdminStats = z.infer<typeof assessabilityAdminStatsSchema>

export const assessabilityAdminActionSchema = z.enum(['refresh_assessability_summary'])
export type AssessabilityAdminAction = z.infer<typeof assessabilityAdminActionSchema>

export const assessabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assessabilityAdminRecordSchema),
  stats: assessabilityAdminStatsSchema,
  availableActions: z.array(assessabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssessabilityAdminSummaryResponse = z.infer<
  typeof assessabilityAdminSummaryResponseSchema
>

export const assessabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assessabilityAdminActionSchema,
})
export type AssessabilityAdminActionRequest = z.infer<
  typeof assessabilityAdminActionRequestSchema
>

export const assessabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assessabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assessabilityAdminStatsSchema.optional(),
})
export type AssessabilityAdminActionResponse = z.infer<
  typeof assessabilityAdminActionResponseSchema
>
