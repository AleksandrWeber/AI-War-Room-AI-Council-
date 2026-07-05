import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const paginizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type PaginizabilityAdminDomain = z.infer<typeof paginizabilityAdminDomainSchema>

export const paginizabilityAdminRecordSchema = z.object({
  domain: paginizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PaginizabilityAdminRecord = z.infer<typeof paginizabilityAdminRecordSchema>

export const paginizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  paginizabilityPercent: z.number().min(0).max(100),
})
export type PaginizabilityAdminStats = z.infer<typeof paginizabilityAdminStatsSchema>

export const paginizabilityAdminActionSchema = z.enum(['refresh_paginizability_summary'])
export type PaginizabilityAdminAction = z.infer<typeof paginizabilityAdminActionSchema>

export const paginizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(paginizabilityAdminRecordSchema),
  stats: paginizabilityAdminStatsSchema,
  availableActions: z.array(paginizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PaginizabilityAdminSummaryResponse = z.infer<
  typeof paginizabilityAdminSummaryResponseSchema
>

export const paginizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: paginizabilityAdminActionSchema,
})
export type PaginizabilityAdminActionRequest = z.infer<
  typeof paginizabilityAdminActionRequestSchema
>

export const paginizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: paginizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: paginizabilityAdminStatsSchema.optional(),
})
export type PaginizabilityAdminActionResponse = z.infer<
  typeof paginizabilityAdminActionResponseSchema
>
