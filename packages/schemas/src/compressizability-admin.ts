import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compressizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type CompressizabilityAdminDomain = z.infer<typeof compressizabilityAdminDomainSchema>

export const compressizabilityAdminRecordSchema = z.object({
  domain: compressizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompressizabilityAdminRecord = z.infer<typeof compressizabilityAdminRecordSchema>

export const compressizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compressizabilityPercent: z.number().min(0).max(100),
})
export type CompressizabilityAdminStats = z.infer<typeof compressizabilityAdminStatsSchema>

export const compressizabilityAdminActionSchema = z.enum(['refresh_compressizability_summary'])
export type CompressizabilityAdminAction = z.infer<typeof compressizabilityAdminActionSchema>

export const compressizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compressizabilityAdminRecordSchema),
  stats: compressizabilityAdminStatsSchema,
  availableActions: z.array(compressizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompressizabilityAdminSummaryResponse = z.infer<
  typeof compressizabilityAdminSummaryResponseSchema
>

export const compressizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compressizabilityAdminActionSchema,
})
export type CompressizabilityAdminActionRequest = z.infer<
  typeof compressizabilityAdminActionRequestSchema
>

export const compressizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compressizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compressizabilityAdminStatsSchema.optional(),
})
export type CompressizabilityAdminActionResponse = z.infer<
  typeof compressizabilityAdminActionResponseSchema
>
