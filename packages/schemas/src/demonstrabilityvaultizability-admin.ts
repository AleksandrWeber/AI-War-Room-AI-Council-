import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const demonstrabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DemonstrabilityvaultizabilityAdminDomain = z.infer<typeof demonstrabilityvaultizabilityAdminDomainSchema>

export const demonstrabilityvaultizabilityAdminRecordSchema = z.object({
  domain: demonstrabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DemonstrabilityvaultizabilityAdminRecord = z.infer<typeof demonstrabilityvaultizabilityAdminRecordSchema>

export const demonstrabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  demonstrabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DemonstrabilityvaultizabilityAdminStats = z.infer<typeof demonstrabilityvaultizabilityAdminStatsSchema>

export const demonstrabilityvaultizabilityAdminActionSchema = z.enum(['refresh_demonstrabilityvaultizability_summary'])
export type DemonstrabilityvaultizabilityAdminAction = z.infer<typeof demonstrabilityvaultizabilityAdminActionSchema>

export const demonstrabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(demonstrabilityvaultizabilityAdminRecordSchema),
  stats: demonstrabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(demonstrabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DemonstrabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof demonstrabilityvaultizabilityAdminSummaryResponseSchema
>

export const demonstrabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: demonstrabilityvaultizabilityAdminActionSchema,
})
export type DemonstrabilityvaultizabilityAdminActionRequest = z.infer<
  typeof demonstrabilityvaultizabilityAdminActionRequestSchema
>

export const demonstrabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: demonstrabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: demonstrabilityvaultizabilityAdminStatsSchema.optional(),
})
export type DemonstrabilityvaultizabilityAdminActionResponse = z.infer<
  typeof demonstrabilityvaultizabilityAdminActionResponseSchema
>
