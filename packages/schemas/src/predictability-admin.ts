import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const predictabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'billing_invoices',
])
export type PredictabilityAdminDomain = z.infer<typeof predictabilityAdminDomainSchema>

export const predictabilityAdminRecordSchema = z.object({
  domain: predictabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PredictabilityAdminRecord = z.infer<typeof predictabilityAdminRecordSchema>

export const predictabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  predictabilityPercent: z.number().min(0).max(100),
})
export type PredictabilityAdminStats = z.infer<typeof predictabilityAdminStatsSchema>

export const predictabilityAdminActionSchema = z.enum(['refresh_predictability_summary'])
export type PredictabilityAdminAction = z.infer<typeof predictabilityAdminActionSchema>

export const predictabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(predictabilityAdminRecordSchema),
  stats: predictabilityAdminStatsSchema,
  availableActions: z.array(predictabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PredictabilityAdminSummaryResponse = z.infer<
  typeof predictabilityAdminSummaryResponseSchema
>

export const predictabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictabilityAdminActionSchema,
})
export type PredictabilityAdminActionRequest = z.infer<
  typeof predictabilityAdminActionRequestSchema
>

export const predictabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: predictabilityAdminStatsSchema.optional(),
})
export type PredictabilityAdminActionResponse = z.infer<
  typeof predictabilityAdminActionResponseSchema
>
