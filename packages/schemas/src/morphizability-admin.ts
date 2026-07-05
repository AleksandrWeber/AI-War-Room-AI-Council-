import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const morphizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type MorphizabilityAdminDomain = z.infer<typeof morphizabilityAdminDomainSchema>

export const morphizabilityAdminRecordSchema = z.object({
  domain: morphizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MorphizabilityAdminRecord = z.infer<typeof morphizabilityAdminRecordSchema>

export const morphizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  morphizabilityPercent: z.number().min(0).max(100),
})
export type MorphizabilityAdminStats = z.infer<typeof morphizabilityAdminStatsSchema>

export const morphizabilityAdminActionSchema = z.enum(['refresh_morphizability_summary'])
export type MorphizabilityAdminAction = z.infer<typeof morphizabilityAdminActionSchema>

export const morphizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(morphizabilityAdminRecordSchema),
  stats: morphizabilityAdminStatsSchema,
  availableActions: z.array(morphizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MorphizabilityAdminSummaryResponse = z.infer<
  typeof morphizabilityAdminSummaryResponseSchema
>

export const morphizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: morphizabilityAdminActionSchema,
})
export type MorphizabilityAdminActionRequest = z.infer<
  typeof morphizabilityAdminActionRequestSchema
>

export const morphizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: morphizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: morphizabilityAdminStatsSchema.optional(),
})
export type MorphizabilityAdminActionResponse = z.infer<
  typeof morphizabilityAdminActionResponseSchema
>
