import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const bufferizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type BufferizabilityAdminDomain = z.infer<typeof bufferizabilityAdminDomainSchema>

export const bufferizabilityAdminRecordSchema = z.object({
  domain: bufferizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BufferizabilityAdminRecord = z.infer<typeof bufferizabilityAdminRecordSchema>

export const bufferizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  bufferizabilityPercent: z.number().min(0).max(100),
})
export type BufferizabilityAdminStats = z.infer<typeof bufferizabilityAdminStatsSchema>

export const bufferizabilityAdminActionSchema = z.enum(['refresh_bufferizability_summary'])
export type BufferizabilityAdminAction = z.infer<typeof bufferizabilityAdminActionSchema>

export const bufferizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(bufferizabilityAdminRecordSchema),
  stats: bufferizabilityAdminStatsSchema,
  availableActions: z.array(bufferizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BufferizabilityAdminSummaryResponse = z.infer<
  typeof bufferizabilityAdminSummaryResponseSchema
>

export const bufferizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bufferizabilityAdminActionSchema,
})
export type BufferizabilityAdminActionRequest = z.infer<
  typeof bufferizabilityAdminActionRequestSchema
>

export const bufferizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bufferizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: bufferizabilityAdminStatsSchema.optional(),
})
export type BufferizabilityAdminActionResponse = z.infer<
  typeof bufferizabilityAdminActionResponseSchema
>
