import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const predictizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type PredictizabilityAdminDomain = z.infer<typeof predictizabilityAdminDomainSchema>

export const predictizabilityAdminRecordSchema = z.object({
  domain: predictizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PredictizabilityAdminRecord = z.infer<typeof predictizabilityAdminRecordSchema>

export const predictizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  predictizabilityPercent: z.number().min(0).max(100),
})
export type PredictizabilityAdminStats = z.infer<typeof predictizabilityAdminStatsSchema>

export const predictizabilityAdminActionSchema = z.enum(['refresh_predictizability_summary'])
export type PredictizabilityAdminAction = z.infer<typeof predictizabilityAdminActionSchema>

export const predictizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(predictizabilityAdminRecordSchema),
  stats: predictizabilityAdminStatsSchema,
  availableActions: z.array(predictizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PredictizabilityAdminSummaryResponse = z.infer<
  typeof predictizabilityAdminSummaryResponseSchema
>

export const predictizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictizabilityAdminActionSchema,
})
export type PredictizabilityAdminActionRequest = z.infer<
  typeof predictizabilityAdminActionRequestSchema
>

export const predictizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: predictizabilityAdminStatsSchema.optional(),
})
export type PredictizabilityAdminActionResponse = z.infer<
  typeof predictizabilityAdminActionResponseSchema
>
