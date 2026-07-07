import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const healingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type HealingizabilityAdminDomain = z.infer<typeof healingizabilityAdminDomainSchema>

export const healingizabilityAdminRecordSchema = z.object({
  domain: healingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HealingizabilityAdminRecord = z.infer<typeof healingizabilityAdminRecordSchema>

export const healingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  healingizabilityPercent: z.number().min(0).max(100),
})
export type HealingizabilityAdminStats = z.infer<typeof healingizabilityAdminStatsSchema>

export const healingizabilityAdminActionSchema = z.enum(['refresh_healingizability_summary'])
export type HealingizabilityAdminAction = z.infer<typeof healingizabilityAdminActionSchema>

export const healingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(healingizabilityAdminRecordSchema),
  stats: healingizabilityAdminStatsSchema,
  availableActions: z.array(healingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HealingizabilityAdminSummaryResponse = z.infer<
  typeof healingizabilityAdminSummaryResponseSchema
>

export const healingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: healingizabilityAdminActionSchema,
})
export type HealingizabilityAdminActionRequest = z.infer<
  typeof healingizabilityAdminActionRequestSchema
>

export const healingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: healingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: healingizabilityAdminStatsSchema.optional(),
})
export type HealingizabilityAdminActionResponse = z.infer<
  typeof healingizabilityAdminActionResponseSchema
>
