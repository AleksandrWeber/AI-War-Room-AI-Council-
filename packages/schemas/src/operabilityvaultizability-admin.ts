import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const operabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type OperabilityvaultizabilityAdminDomain = z.infer<typeof operabilityvaultizabilityAdminDomainSchema>

export const operabilityvaultizabilityAdminRecordSchema = z.object({
  domain: operabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OperabilityvaultizabilityAdminRecord = z.infer<typeof operabilityvaultizabilityAdminRecordSchema>

export const operabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  operabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type OperabilityvaultizabilityAdminStats = z.infer<typeof operabilityvaultizabilityAdminStatsSchema>

export const operabilityvaultizabilityAdminActionSchema = z.enum(['refresh_operabilityvaultizability_summary'])
export type OperabilityvaultizabilityAdminAction = z.infer<typeof operabilityvaultizabilityAdminActionSchema>

export const operabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(operabilityvaultizabilityAdminRecordSchema),
  stats: operabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(operabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OperabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof operabilityvaultizabilityAdminSummaryResponseSchema
>

export const operabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilityvaultizabilityAdminActionSchema,
})
export type OperabilityvaultizabilityAdminActionRequest = z.infer<
  typeof operabilityvaultizabilityAdminActionRequestSchema
>

export const operabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: operabilityvaultizabilityAdminStatsSchema.optional(),
})
export type OperabilityvaultizabilityAdminActionResponse = z.infer<
  typeof operabilityvaultizabilityAdminActionResponseSchema
>
