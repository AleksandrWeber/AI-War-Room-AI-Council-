import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ontologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type OntologizabilityAdminDomain = z.infer<typeof ontologizabilityAdminDomainSchema>

export const ontologizabilityAdminRecordSchema = z.object({
  domain: ontologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OntologizabilityAdminRecord = z.infer<typeof ontologizabilityAdminRecordSchema>

export const ontologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ontologizabilityPercent: z.number().min(0).max(100),
})
export type OntologizabilityAdminStats = z.infer<typeof ontologizabilityAdminStatsSchema>

export const ontologizabilityAdminActionSchema = z.enum(['refresh_ontologizability_summary'])
export type OntologizabilityAdminAction = z.infer<typeof ontologizabilityAdminActionSchema>

export const ontologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ontologizabilityAdminRecordSchema),
  stats: ontologizabilityAdminStatsSchema,
  availableActions: z.array(ontologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OntologizabilityAdminSummaryResponse = z.infer<
  typeof ontologizabilityAdminSummaryResponseSchema
>

export const ontologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ontologizabilityAdminActionSchema,
})
export type OntologizabilityAdminActionRequest = z.infer<
  typeof ontologizabilityAdminActionRequestSchema
>

export const ontologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ontologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ontologizabilityAdminStatsSchema.optional(),
})
export type OntologizabilityAdminActionResponse = z.infer<
  typeof ontologizabilityAdminActionResponseSchema
>
