import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const comparabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ComparabilityvaultizabilityAdminDomain = z.infer<typeof comparabilityvaultizabilityAdminDomainSchema>

export const comparabilityvaultizabilityAdminRecordSchema = z.object({
  domain: comparabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComparabilityvaultizabilityAdminRecord = z.infer<typeof comparabilityvaultizabilityAdminRecordSchema>

export const comparabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  comparabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ComparabilityvaultizabilityAdminStats = z.infer<typeof comparabilityvaultizabilityAdminStatsSchema>

export const comparabilityvaultizabilityAdminActionSchema = z.enum(['refresh_comparabilityvaultizability_summary'])
export type ComparabilityvaultizabilityAdminAction = z.infer<typeof comparabilityvaultizabilityAdminActionSchema>

export const comparabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(comparabilityvaultizabilityAdminRecordSchema),
  stats: comparabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(comparabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComparabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof comparabilityvaultizabilityAdminSummaryResponseSchema
>

export const comparabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparabilityvaultizabilityAdminActionSchema,
})
export type ComparabilityvaultizabilityAdminActionRequest = z.infer<
  typeof comparabilityvaultizabilityAdminActionRequestSchema
>

export const comparabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: comparabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ComparabilityvaultizabilityAdminActionResponse = z.infer<
  typeof comparabilityvaultizabilityAdminActionResponseSchema
>
