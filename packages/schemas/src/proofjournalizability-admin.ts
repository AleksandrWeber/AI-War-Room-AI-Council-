import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const proofjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ProofjournalizabilityAdminDomain = z.infer<typeof proofjournalizabilityAdminDomainSchema>

export const proofjournalizabilityAdminRecordSchema = z.object({
  domain: proofjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProofjournalizabilityAdminRecord = z.infer<typeof proofjournalizabilityAdminRecordSchema>

export const proofjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  proofjournalizabilityPercent: z.number().min(0).max(100),
})
export type ProofjournalizabilityAdminStats = z.infer<typeof proofjournalizabilityAdminStatsSchema>

export const proofjournalizabilityAdminActionSchema = z.enum(['refresh_proofjournalizability_summary'])
export type ProofjournalizabilityAdminAction = z.infer<typeof proofjournalizabilityAdminActionSchema>

export const proofjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(proofjournalizabilityAdminRecordSchema),
  stats: proofjournalizabilityAdminStatsSchema,
  availableActions: z.array(proofjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProofjournalizabilityAdminSummaryResponse = z.infer<
  typeof proofjournalizabilityAdminSummaryResponseSchema
>

export const proofjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: proofjournalizabilityAdminActionSchema,
})
export type ProofjournalizabilityAdminActionRequest = z.infer<
  typeof proofjournalizabilityAdminActionRequestSchema
>

export const proofjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: proofjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: proofjournalizabilityAdminStatsSchema.optional(),
})
export type ProofjournalizabilityAdminActionResponse = z.infer<
  typeof proofjournalizabilityAdminActionResponseSchema
>
