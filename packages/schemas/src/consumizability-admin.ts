import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const consumizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ConsumizabilityAdminDomain = z.infer<typeof consumizabilityAdminDomainSchema>

export const consumizabilityAdminRecordSchema = z.object({
  domain: consumizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConsumizabilityAdminRecord = z.infer<typeof consumizabilityAdminRecordSchema>

export const consumizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  consumizabilityPercent: z.number().min(0).max(100),
})
export type ConsumizabilityAdminStats = z.infer<typeof consumizabilityAdminStatsSchema>

export const consumizabilityAdminActionSchema = z.enum(['refresh_consumizability_summary'])
export type ConsumizabilityAdminAction = z.infer<typeof consumizabilityAdminActionSchema>

export const consumizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(consumizabilityAdminRecordSchema),
  stats: consumizabilityAdminStatsSchema,
  availableActions: z.array(consumizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConsumizabilityAdminSummaryResponse = z.infer<
  typeof consumizabilityAdminSummaryResponseSchema
>

export const consumizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consumizabilityAdminActionSchema,
})
export type ConsumizabilityAdminActionRequest = z.infer<
  typeof consumizabilityAdminActionRequestSchema
>

export const consumizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consumizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: consumizabilityAdminStatsSchema.optional(),
})
export type ConsumizabilityAdminActionResponse = z.infer<
  typeof consumizabilityAdminActionResponseSchema
>
