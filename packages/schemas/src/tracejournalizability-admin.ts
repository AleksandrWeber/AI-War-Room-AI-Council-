import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tracejournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TracejournalizabilityAdminDomain = z.infer<typeof tracejournalizabilityAdminDomainSchema>

export const tracejournalizabilityAdminRecordSchema = z.object({
  domain: tracejournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TracejournalizabilityAdminRecord = z.infer<typeof tracejournalizabilityAdminRecordSchema>

export const tracejournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tracejournalizabilityPercent: z.number().min(0).max(100),
})
export type TracejournalizabilityAdminStats = z.infer<typeof tracejournalizabilityAdminStatsSchema>

export const tracejournalizabilityAdminActionSchema = z.enum(['refresh_tracejournalizability_summary'])
export type TracejournalizabilityAdminAction = z.infer<typeof tracejournalizabilityAdminActionSchema>

export const tracejournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tracejournalizabilityAdminRecordSchema),
  stats: tracejournalizabilityAdminStatsSchema,
  availableActions: z.array(tracejournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TracejournalizabilityAdminSummaryResponse = z.infer<
  typeof tracejournalizabilityAdminSummaryResponseSchema
>

export const tracejournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tracejournalizabilityAdminActionSchema,
})
export type TracejournalizabilityAdminActionRequest = z.infer<
  typeof tracejournalizabilityAdminActionRequestSchema
>

export const tracejournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tracejournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tracejournalizabilityAdminStatsSchema.optional(),
})
export type TracejournalizabilityAdminActionResponse = z.infer<
  typeof tracejournalizabilityAdminActionResponseSchema
>
