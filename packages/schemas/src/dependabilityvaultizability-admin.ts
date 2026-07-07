import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dependabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DependabilityvaultizabilityAdminDomain = z.infer<typeof dependabilityvaultizabilityAdminDomainSchema>

export const dependabilityvaultizabilityAdminRecordSchema = z.object({
  domain: dependabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DependabilityvaultizabilityAdminRecord = z.infer<typeof dependabilityvaultizabilityAdminRecordSchema>

export const dependabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dependabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DependabilityvaultizabilityAdminStats = z.infer<typeof dependabilityvaultizabilityAdminStatsSchema>

export const dependabilityvaultizabilityAdminActionSchema = z.enum(['refresh_dependabilityvaultizability_summary'])
export type DependabilityvaultizabilityAdminAction = z.infer<typeof dependabilityvaultizabilityAdminActionSchema>

export const dependabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dependabilityvaultizabilityAdminRecordSchema),
  stats: dependabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(dependabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DependabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof dependabilityvaultizabilityAdminSummaryResponseSchema
>

export const dependabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependabilityvaultizabilityAdminActionSchema,
})
export type DependabilityvaultizabilityAdminActionRequest = z.infer<
  typeof dependabilityvaultizabilityAdminActionRequestSchema
>

export const dependabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dependabilityvaultizabilityAdminStatsSchema.optional(),
})
export type DependabilityvaultizabilityAdminActionResponse = z.infer<
  typeof dependabilityvaultizabilityAdminActionResponseSchema
>
