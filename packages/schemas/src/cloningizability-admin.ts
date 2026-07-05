import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const cloningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type CloningizabilityAdminDomain = z.infer<typeof cloningizabilityAdminDomainSchema>

export const cloningizabilityAdminRecordSchema = z.object({
  domain: cloningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CloningizabilityAdminRecord = z.infer<typeof cloningizabilityAdminRecordSchema>

export const cloningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  cloningizabilityPercent: z.number().min(0).max(100),
})
export type CloningizabilityAdminStats = z.infer<typeof cloningizabilityAdminStatsSchema>

export const cloningizabilityAdminActionSchema = z.enum(['refresh_cloningizability_summary'])
export type CloningizabilityAdminAction = z.infer<typeof cloningizabilityAdminActionSchema>

export const cloningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(cloningizabilityAdminRecordSchema),
  stats: cloningizabilityAdminStatsSchema,
  availableActions: z.array(cloningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CloningizabilityAdminSummaryResponse = z.infer<
  typeof cloningizabilityAdminSummaryResponseSchema
>

export const cloningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cloningizabilityAdminActionSchema,
})
export type CloningizabilityAdminActionRequest = z.infer<
  typeof cloningizabilityAdminActionRequestSchema
>

export const cloningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cloningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: cloningizabilityAdminStatsSchema.optional(),
})
export type CloningizabilityAdminActionResponse = z.infer<
  typeof cloningizabilityAdminActionResponseSchema
>
