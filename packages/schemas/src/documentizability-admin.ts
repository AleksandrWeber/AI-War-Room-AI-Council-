import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const documentizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type DocumentizabilityAdminDomain = z.infer<typeof documentizabilityAdminDomainSchema>

export const documentizabilityAdminRecordSchema = z.object({
  domain: documentizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DocumentizabilityAdminRecord = z.infer<typeof documentizabilityAdminRecordSchema>

export const documentizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  documentizabilityPercent: z.number().min(0).max(100),
})
export type DocumentizabilityAdminStats = z.infer<typeof documentizabilityAdminStatsSchema>

export const documentizabilityAdminActionSchema = z.enum(['refresh_documentizability_summary'])
export type DocumentizabilityAdminAction = z.infer<typeof documentizabilityAdminActionSchema>

export const documentizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(documentizabilityAdminRecordSchema),
  stats: documentizabilityAdminStatsSchema,
  availableActions: z.array(documentizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DocumentizabilityAdminSummaryResponse = z.infer<
  typeof documentizabilityAdminSummaryResponseSchema
>

export const documentizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: documentizabilityAdminActionSchema,
})
export type DocumentizabilityAdminActionRequest = z.infer<
  typeof documentizabilityAdminActionRequestSchema
>

export const documentizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: documentizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: documentizabilityAdminStatsSchema.optional(),
})
export type DocumentizabilityAdminActionResponse = z.infer<
  typeof documentizabilityAdminActionResponseSchema
>
