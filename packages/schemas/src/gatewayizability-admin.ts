import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const gatewayizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type GatewayizabilityAdminDomain = z.infer<typeof gatewayizabilityAdminDomainSchema>

export const gatewayizabilityAdminRecordSchema = z.object({
  domain: gatewayizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GatewayizabilityAdminRecord = z.infer<typeof gatewayizabilityAdminRecordSchema>

export const gatewayizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  gatewayizabilityPercent: z.number().min(0).max(100),
})
export type GatewayizabilityAdminStats = z.infer<typeof gatewayizabilityAdminStatsSchema>

export const gatewayizabilityAdminActionSchema = z.enum(['refresh_gatewayizability_summary'])
export type GatewayizabilityAdminAction = z.infer<typeof gatewayizabilityAdminActionSchema>

export const gatewayizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(gatewayizabilityAdminRecordSchema),
  stats: gatewayizabilityAdminStatsSchema,
  availableActions: z.array(gatewayizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GatewayizabilityAdminSummaryResponse = z.infer<
  typeof gatewayizabilityAdminSummaryResponseSchema
>

export const gatewayizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: gatewayizabilityAdminActionSchema,
})
export type GatewayizabilityAdminActionRequest = z.infer<
  typeof gatewayizabilityAdminActionRequestSchema
>

export const gatewayizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: gatewayizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: gatewayizabilityAdminStatsSchema.optional(),
})
export type GatewayizabilityAdminActionResponse = z.infer<
  typeof gatewayizabilityAdminActionResponseSchema
>
