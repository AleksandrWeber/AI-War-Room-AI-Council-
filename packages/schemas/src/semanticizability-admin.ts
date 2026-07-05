import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const semanticizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type SemanticizabilityAdminDomain = z.infer<typeof semanticizabilityAdminDomainSchema>

export const semanticizabilityAdminRecordSchema = z.object({
  domain: semanticizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SemanticizabilityAdminRecord = z.infer<typeof semanticizabilityAdminRecordSchema>

export const semanticizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  semanticizabilityPercent: z.number().min(0).max(100),
})
export type SemanticizabilityAdminStats = z.infer<typeof semanticizabilityAdminStatsSchema>

export const semanticizabilityAdminActionSchema = z.enum(['refresh_semanticizability_summary'])
export type SemanticizabilityAdminAction = z.infer<typeof semanticizabilityAdminActionSchema>

export const semanticizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(semanticizabilityAdminRecordSchema),
  stats: semanticizabilityAdminStatsSchema,
  availableActions: z.array(semanticizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SemanticizabilityAdminSummaryResponse = z.infer<
  typeof semanticizabilityAdminSummaryResponseSchema
>

export const semanticizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: semanticizabilityAdminActionSchema,
})
export type SemanticizabilityAdminActionRequest = z.infer<
  typeof semanticizabilityAdminActionRequestSchema
>

export const semanticizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: semanticizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: semanticizabilityAdminStatsSchema.optional(),
})
export type SemanticizabilityAdminActionResponse = z.infer<
  typeof semanticizabilityAdminActionResponseSchema
>
