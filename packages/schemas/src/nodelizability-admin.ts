import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const nodelizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type NodelizabilityAdminDomain = z.infer<typeof nodelizabilityAdminDomainSchema>

export const nodelizabilityAdminRecordSchema = z.object({
  domain: nodelizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NodelizabilityAdminRecord = z.infer<typeof nodelizabilityAdminRecordSchema>

export const nodelizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  nodelizabilityPercent: z.number().min(0).max(100),
})
export type NodelizabilityAdminStats = z.infer<typeof nodelizabilityAdminStatsSchema>

export const nodelizabilityAdminActionSchema = z.enum(['refresh_nodelizability_summary'])
export type NodelizabilityAdminAction = z.infer<typeof nodelizabilityAdminActionSchema>

export const nodelizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(nodelizabilityAdminRecordSchema),
  stats: nodelizabilityAdminStatsSchema,
  availableActions: z.array(nodelizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NodelizabilityAdminSummaryResponse = z.infer<
  typeof nodelizabilityAdminSummaryResponseSchema
>

export const nodelizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nodelizabilityAdminActionSchema,
})
export type NodelizabilityAdminActionRequest = z.infer<
  typeof nodelizabilityAdminActionRequestSchema
>

export const nodelizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nodelizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: nodelizabilityAdminStatsSchema.optional(),
})
export type NodelizabilityAdminActionResponse = z.infer<
  typeof nodelizabilityAdminActionResponseSchema
>
