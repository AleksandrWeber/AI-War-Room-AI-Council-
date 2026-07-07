import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tracevaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TracevaultizabilityAdminDomain = z.infer<typeof tracevaultizabilityAdminDomainSchema>

export const tracevaultizabilityAdminRecordSchema = z.object({
  domain: tracevaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TracevaultizabilityAdminRecord = z.infer<typeof tracevaultizabilityAdminRecordSchema>

export const tracevaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tracevaultizabilityPercent: z.number().min(0).max(100),
})
export type TracevaultizabilityAdminStats = z.infer<typeof tracevaultizabilityAdminStatsSchema>

export const tracevaultizabilityAdminActionSchema = z.enum(['refresh_tracevaultizability_summary'])
export type TracevaultizabilityAdminAction = z.infer<typeof tracevaultizabilityAdminActionSchema>

export const tracevaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tracevaultizabilityAdminRecordSchema),
  stats: tracevaultizabilityAdminStatsSchema,
  availableActions: z.array(tracevaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TracevaultizabilityAdminSummaryResponse = z.infer<
  typeof tracevaultizabilityAdminSummaryResponseSchema
>

export const tracevaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tracevaultizabilityAdminActionSchema,
})
export type TracevaultizabilityAdminActionRequest = z.infer<
  typeof tracevaultizabilityAdminActionRequestSchema
>

export const tracevaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tracevaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tracevaultizabilityAdminStatsSchema.optional(),
})
export type TracevaultizabilityAdminActionResponse = z.infer<
  typeof tracevaultizabilityAdminActionResponseSchema
>
