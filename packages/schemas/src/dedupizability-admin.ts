import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dedupizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type DedupizabilityAdminDomain = z.infer<typeof dedupizabilityAdminDomainSchema>

export const dedupizabilityAdminRecordSchema = z.object({
  domain: dedupizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DedupizabilityAdminRecord = z.infer<typeof dedupizabilityAdminRecordSchema>

export const dedupizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dedupizabilityPercent: z.number().min(0).max(100),
})
export type DedupizabilityAdminStats = z.infer<typeof dedupizabilityAdminStatsSchema>

export const dedupizabilityAdminActionSchema = z.enum(['refresh_dedupizability_summary'])
export type DedupizabilityAdminAction = z.infer<typeof dedupizabilityAdminActionSchema>

export const dedupizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dedupizabilityAdminRecordSchema),
  stats: dedupizabilityAdminStatsSchema,
  availableActions: z.array(dedupizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DedupizabilityAdminSummaryResponse = z.infer<
  typeof dedupizabilityAdminSummaryResponseSchema
>

export const dedupizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dedupizabilityAdminActionSchema,
})
export type DedupizabilityAdminActionRequest = z.infer<
  typeof dedupizabilityAdminActionRequestSchema
>

export const dedupizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dedupizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dedupizabilityAdminStatsSchema.optional(),
})
export type DedupizabilityAdminActionResponse = z.infer<
  typeof dedupizabilityAdminActionResponseSchema
>
