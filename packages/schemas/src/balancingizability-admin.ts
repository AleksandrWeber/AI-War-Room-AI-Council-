import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const balancingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type BalancingizabilityAdminDomain = z.infer<typeof balancingizabilityAdminDomainSchema>

export const balancingizabilityAdminRecordSchema = z.object({
  domain: balancingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BalancingizabilityAdminRecord = z.infer<typeof balancingizabilityAdminRecordSchema>

export const balancingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  balancingizabilityPercent: z.number().min(0).max(100),
})
export type BalancingizabilityAdminStats = z.infer<typeof balancingizabilityAdminStatsSchema>

export const balancingizabilityAdminActionSchema = z.enum(['refresh_balancingizability_summary'])
export type BalancingizabilityAdminAction = z.infer<typeof balancingizabilityAdminActionSchema>

export const balancingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(balancingizabilityAdminRecordSchema),
  stats: balancingizabilityAdminStatsSchema,
  availableActions: z.array(balancingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BalancingizabilityAdminSummaryResponse = z.infer<
  typeof balancingizabilityAdminSummaryResponseSchema
>

export const balancingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: balancingizabilityAdminActionSchema,
})
export type BalancingizabilityAdminActionRequest = z.infer<
  typeof balancingizabilityAdminActionRequestSchema
>

export const balancingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: balancingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: balancingizabilityAdminStatsSchema.optional(),
})
export type BalancingizabilityAdminActionResponse = z.infer<
  typeof balancingizabilityAdminActionResponseSchema
>
