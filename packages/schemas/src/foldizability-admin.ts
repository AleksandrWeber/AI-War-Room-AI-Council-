import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const foldizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type FoldizabilityAdminDomain = z.infer<typeof foldizabilityAdminDomainSchema>

export const foldizabilityAdminRecordSchema = z.object({
  domain: foldizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FoldizabilityAdminRecord = z.infer<typeof foldizabilityAdminRecordSchema>

export const foldizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  foldizabilityPercent: z.number().min(0).max(100),
})
export type FoldizabilityAdminStats = z.infer<typeof foldizabilityAdminStatsSchema>

export const foldizabilityAdminActionSchema = z.enum(['refresh_foldizability_summary'])
export type FoldizabilityAdminAction = z.infer<typeof foldizabilityAdminActionSchema>

export const foldizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(foldizabilityAdminRecordSchema),
  stats: foldizabilityAdminStatsSchema,
  availableActions: z.array(foldizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FoldizabilityAdminSummaryResponse = z.infer<
  typeof foldizabilityAdminSummaryResponseSchema
>

export const foldizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: foldizabilityAdminActionSchema,
})
export type FoldizabilityAdminActionRequest = z.infer<
  typeof foldizabilityAdminActionRequestSchema
>

export const foldizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: foldizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: foldizabilityAdminStatsSchema.optional(),
})
export type FoldizabilityAdminActionResponse = z.infer<
  typeof foldizabilityAdminActionResponseSchema
>
