import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const methodizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type MethodizabilityAdminDomain = z.infer<typeof methodizabilityAdminDomainSchema>

export const methodizabilityAdminRecordSchema = z.object({
  domain: methodizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MethodizabilityAdminRecord = z.infer<typeof methodizabilityAdminRecordSchema>

export const methodizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  methodizabilityPercent: z.number().min(0).max(100),
})
export type MethodizabilityAdminStats = z.infer<typeof methodizabilityAdminStatsSchema>

export const methodizabilityAdminActionSchema = z.enum(['refresh_methodizability_summary'])
export type MethodizabilityAdminAction = z.infer<typeof methodizabilityAdminActionSchema>

export const methodizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(methodizabilityAdminRecordSchema),
  stats: methodizabilityAdminStatsSchema,
  availableActions: z.array(methodizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MethodizabilityAdminSummaryResponse = z.infer<
  typeof methodizabilityAdminSummaryResponseSchema
>

export const methodizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: methodizabilityAdminActionSchema,
})
export type MethodizabilityAdminActionRequest = z.infer<
  typeof methodizabilityAdminActionRequestSchema
>

export const methodizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: methodizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: methodizabilityAdminStatsSchema.optional(),
})
export type MethodizabilityAdminActionResponse = z.infer<
  typeof methodizabilityAdminActionResponseSchema
>
