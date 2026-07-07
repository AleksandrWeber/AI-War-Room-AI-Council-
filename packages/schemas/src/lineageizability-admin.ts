import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const lineageizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type LineageizabilityAdminDomain = z.infer<typeof lineageizabilityAdminDomainSchema>

export const lineageizabilityAdminRecordSchema = z.object({
  domain: lineageizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LineageizabilityAdminRecord = z.infer<typeof lineageizabilityAdminRecordSchema>

export const lineageizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  lineageizabilityPercent: z.number().min(0).max(100),
})
export type LineageizabilityAdminStats = z.infer<typeof lineageizabilityAdminStatsSchema>

export const lineageizabilityAdminActionSchema = z.enum(['refresh_lineageizability_summary'])
export type LineageizabilityAdminAction = z.infer<typeof lineageizabilityAdminActionSchema>

export const lineageizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(lineageizabilityAdminRecordSchema),
  stats: lineageizabilityAdminStatsSchema,
  availableActions: z.array(lineageizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LineageizabilityAdminSummaryResponse = z.infer<
  typeof lineageizabilityAdminSummaryResponseSchema
>

export const lineageizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: lineageizabilityAdminActionSchema,
})
export type LineageizabilityAdminActionRequest = z.infer<
  typeof lineageizabilityAdminActionRequestSchema
>

export const lineageizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: lineageizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: lineageizabilityAdminStatsSchema.optional(),
})
export type LineageizabilityAdminActionResponse = z.infer<
  typeof lineageizabilityAdminActionResponseSchema
>
