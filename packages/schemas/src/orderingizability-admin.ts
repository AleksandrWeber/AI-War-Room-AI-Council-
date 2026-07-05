import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const orderingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type OrderingizabilityAdminDomain = z.infer<typeof orderingizabilityAdminDomainSchema>

export const orderingizabilityAdminRecordSchema = z.object({
  domain: orderingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrderingizabilityAdminRecord = z.infer<typeof orderingizabilityAdminRecordSchema>

export const orderingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  orderingizabilityPercent: z.number().min(0).max(100),
})
export type OrderingizabilityAdminStats = z.infer<typeof orderingizabilityAdminStatsSchema>

export const orderingizabilityAdminActionSchema = z.enum(['refresh_orderingizability_summary'])
export type OrderingizabilityAdminAction = z.infer<typeof orderingizabilityAdminActionSchema>

export const orderingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(orderingizabilityAdminRecordSchema),
  stats: orderingizabilityAdminStatsSchema,
  availableActions: z.array(orderingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrderingizabilityAdminSummaryResponse = z.infer<
  typeof orderingizabilityAdminSummaryResponseSchema
>

export const orderingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orderingizabilityAdminActionSchema,
})
export type OrderingizabilityAdminActionRequest = z.infer<
  typeof orderingizabilityAdminActionRequestSchema
>

export const orderingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orderingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: orderingizabilityAdminStatsSchema.optional(),
})
export type OrderingizabilityAdminActionResponse = z.infer<
  typeof orderingizabilityAdminActionResponseSchema
>
