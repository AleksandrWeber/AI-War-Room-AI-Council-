import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const manageabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ManageabilityvaultizabilityAdminDomain = z.infer<typeof manageabilityvaultizabilityAdminDomainSchema>

export const manageabilityvaultizabilityAdminRecordSchema = z.object({
  domain: manageabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ManageabilityvaultizabilityAdminRecord = z.infer<typeof manageabilityvaultizabilityAdminRecordSchema>

export const manageabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  manageabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ManageabilityvaultizabilityAdminStats = z.infer<typeof manageabilityvaultizabilityAdminStatsSchema>

export const manageabilityvaultizabilityAdminActionSchema = z.enum(['refresh_manageabilityvaultizability_summary'])
export type ManageabilityvaultizabilityAdminAction = z.infer<typeof manageabilityvaultizabilityAdminActionSchema>

export const manageabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(manageabilityvaultizabilityAdminRecordSchema),
  stats: manageabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(manageabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ManageabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof manageabilityvaultizabilityAdminSummaryResponseSchema
>

export const manageabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: manageabilityvaultizabilityAdminActionSchema,
})
export type ManageabilityvaultizabilityAdminActionRequest = z.infer<
  typeof manageabilityvaultizabilityAdminActionRequestSchema
>

export const manageabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: manageabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: manageabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ManageabilityvaultizabilityAdminActionResponse = z.infer<
  typeof manageabilityvaultizabilityAdminActionResponseSchema
>
