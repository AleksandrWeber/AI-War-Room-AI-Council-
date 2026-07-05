import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const connectabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_webhook_events',
])
export type ConnectabilityAdminDomain = z.infer<typeof connectabilityAdminDomainSchema>

export const connectabilityAdminRecordSchema = z.object({
  domain: connectabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConnectabilityAdminRecord = z.infer<typeof connectabilityAdminRecordSchema>

export const connectabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  connectabilityPercent: z.number().min(0).max(100),
})
export type ConnectabilityAdminStats = z.infer<typeof connectabilityAdminStatsSchema>

export const connectabilityAdminActionSchema = z.enum(['refresh_connectability_summary'])
export type ConnectabilityAdminAction = z.infer<typeof connectabilityAdminActionSchema>

export const connectabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(connectabilityAdminRecordSchema),
  stats: connectabilityAdminStatsSchema,
  availableActions: z.array(connectabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilityAdminSummaryResponse = z.infer<
  typeof connectabilityAdminSummaryResponseSchema
>

export const connectabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilityAdminActionSchema,
})
export type ConnectabilityAdminActionRequest = z.infer<
  typeof connectabilityAdminActionRequestSchema
>

export const connectabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connectabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: connectabilityAdminStatsSchema.optional(),
})
export type ConnectabilityAdminActionResponse = z.infer<
  typeof connectabilityAdminActionResponseSchema
>
