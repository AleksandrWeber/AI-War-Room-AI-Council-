import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const typifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type TypifiabilityAdminDomain = z.infer<typeof typifiabilityAdminDomainSchema>

export const typifiabilityAdminRecordSchema = z.object({
  domain: typifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TypifiabilityAdminRecord = z.infer<typeof typifiabilityAdminRecordSchema>

export const typifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  typifiabilityPercent: z.number().min(0).max(100),
})
export type TypifiabilityAdminStats = z.infer<typeof typifiabilityAdminStatsSchema>

export const typifiabilityAdminActionSchema = z.enum(['refresh_typifiability_summary'])
export type TypifiabilityAdminAction = z.infer<typeof typifiabilityAdminActionSchema>

export const typifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(typifiabilityAdminRecordSchema),
  stats: typifiabilityAdminStatsSchema,
  availableActions: z.array(typifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TypifiabilityAdminSummaryResponse = z.infer<
  typeof typifiabilityAdminSummaryResponseSchema
>

export const typifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: typifiabilityAdminActionSchema,
})
export type TypifiabilityAdminActionRequest = z.infer<
  typeof typifiabilityAdminActionRequestSchema
>

export const typifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: typifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: typifiabilityAdminStatsSchema.optional(),
})
export type TypifiabilityAdminActionResponse = z.infer<
  typeof typifiabilityAdminActionResponseSchema
>
