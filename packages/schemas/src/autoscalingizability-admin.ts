import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const autoscalingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type AutoscalingizabilityAdminDomain = z.infer<typeof autoscalingizabilityAdminDomainSchema>

export const autoscalingizabilityAdminRecordSchema = z.object({
  domain: autoscalingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AutoscalingizabilityAdminRecord = z.infer<typeof autoscalingizabilityAdminRecordSchema>

export const autoscalingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  autoscalingizabilityPercent: z.number().min(0).max(100),
})
export type AutoscalingizabilityAdminStats = z.infer<typeof autoscalingizabilityAdminStatsSchema>

export const autoscalingizabilityAdminActionSchema = z.enum(['refresh_autoscalingizability_summary'])
export type AutoscalingizabilityAdminAction = z.infer<typeof autoscalingizabilityAdminActionSchema>

export const autoscalingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(autoscalingizabilityAdminRecordSchema),
  stats: autoscalingizabilityAdminStatsSchema,
  availableActions: z.array(autoscalingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AutoscalingizabilityAdminSummaryResponse = z.infer<
  typeof autoscalingizabilityAdminSummaryResponseSchema
>

export const autoscalingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: autoscalingizabilityAdminActionSchema,
})
export type AutoscalingizabilityAdminActionRequest = z.infer<
  typeof autoscalingizabilityAdminActionRequestSchema
>

export const autoscalingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: autoscalingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: autoscalingizabilityAdminStatsSchema.optional(),
})
export type AutoscalingizabilityAdminActionResponse = z.infer<
  typeof autoscalingizabilityAdminActionResponseSchema
>
