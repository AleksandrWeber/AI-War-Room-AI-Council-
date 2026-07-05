import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const connectabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ConnectabilizabilityAdminDomain = z.infer<typeof connectabilizabilityAdminDomainSchema>

export const connectabilizabilityAdminRecordSchema = z.object({
  domain: connectabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConnectabilizabilityAdminRecord = z.infer<typeof connectabilizabilityAdminRecordSchema>

export const connectabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  connectabilizabilityPercent: z.number().min(0).max(100),
})
export type ConnectabilizabilityAdminStats = z.infer<typeof connectabilizabilityAdminStatsSchema>

export const connectabilizabilityAdminActionSchema = z.enum(['refresh_connectabilizability_summary'])
export type ConnectabilizabilityAdminAction = z.infer<typeof connectabilizabilityAdminActionSchema>

export const connectabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(connectabilizabilityAdminRecordSchema),
  stats: connectabilizabilityAdminStatsSchema,
  availableActions: z.array(connectabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilizabilityAdminSummaryResponse = z.infer<
  typeof connectabilizabilityAdminSummaryResponseSchema
>

export const connectabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilizabilityAdminActionSchema,
})
export type ConnectabilizabilityAdminActionRequest = z.infer<
  typeof connectabilizabilityAdminActionRequestSchema
>

export const connectabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: connectabilizabilityAdminStatsSchema.optional(),
})
export type ConnectabilizabilityAdminActionResponse = z.infer<
  typeof connectabilizabilityAdminActionResponseSchema
>
