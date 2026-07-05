import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const convergizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ConvergizabilityAdminDomain = z.infer<typeof convergizabilityAdminDomainSchema>

export const convergizabilityAdminRecordSchema = z.object({
  domain: convergizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConvergizabilityAdminRecord = z.infer<typeof convergizabilityAdminRecordSchema>

export const convergizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  convergizabilityPercent: z.number().min(0).max(100),
})
export type ConvergizabilityAdminStats = z.infer<typeof convergizabilityAdminStatsSchema>

export const convergizabilityAdminActionSchema = z.enum(['refresh_convergizability_summary'])
export type ConvergizabilityAdminAction = z.infer<typeof convergizabilityAdminActionSchema>

export const convergizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(convergizabilityAdminRecordSchema),
  stats: convergizabilityAdminStatsSchema,
  availableActions: z.array(convergizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConvergizabilityAdminSummaryResponse = z.infer<
  typeof convergizabilityAdminSummaryResponseSchema
>

export const convergizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: convergizabilityAdminActionSchema,
})
export type ConvergizabilityAdminActionRequest = z.infer<
  typeof convergizabilityAdminActionRequestSchema
>

export const convergizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: convergizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: convergizabilityAdminStatsSchema.optional(),
})
export type ConvergizabilityAdminActionResponse = z.infer<
  typeof convergizabilityAdminActionResponseSchema
>
