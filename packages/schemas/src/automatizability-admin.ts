import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const automatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AutomatizabilityAdminDomain = z.infer<typeof automatizabilityAdminDomainSchema>

export const automatizabilityAdminRecordSchema = z.object({
  domain: automatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AutomatizabilityAdminRecord = z.infer<typeof automatizabilityAdminRecordSchema>

export const automatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  automatizabilityPercent: z.number().min(0).max(100),
})
export type AutomatizabilityAdminStats = z.infer<typeof automatizabilityAdminStatsSchema>

export const automatizabilityAdminActionSchema = z.enum(['refresh_automatizability_summary'])
export type AutomatizabilityAdminAction = z.infer<typeof automatizabilityAdminActionSchema>

export const automatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(automatizabilityAdminRecordSchema),
  stats: automatizabilityAdminStatsSchema,
  availableActions: z.array(automatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AutomatizabilityAdminSummaryResponse = z.infer<
  typeof automatizabilityAdminSummaryResponseSchema
>

export const automatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatizabilityAdminActionSchema,
})
export type AutomatizabilityAdminActionRequest = z.infer<
  typeof automatizabilityAdminActionRequestSchema
>

export const automatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: automatizabilityAdminStatsSchema.optional(),
})
export type AutomatizabilityAdminActionResponse = z.infer<
  typeof automatizabilityAdminActionResponseSchema
>
