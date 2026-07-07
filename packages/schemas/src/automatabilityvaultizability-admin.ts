import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const automatabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AutomatabilityvaultizabilityAdminDomain = z.infer<typeof automatabilityvaultizabilityAdminDomainSchema>

export const automatabilityvaultizabilityAdminRecordSchema = z.object({
  domain: automatabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AutomatabilityvaultizabilityAdminRecord = z.infer<typeof automatabilityvaultizabilityAdminRecordSchema>

export const automatabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  automatabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AutomatabilityvaultizabilityAdminStats = z.infer<typeof automatabilityvaultizabilityAdminStatsSchema>

export const automatabilityvaultizabilityAdminActionSchema = z.enum(['refresh_automatabilityvaultizability_summary'])
export type AutomatabilityvaultizabilityAdminAction = z.infer<typeof automatabilityvaultizabilityAdminActionSchema>

export const automatabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(automatabilityvaultizabilityAdminRecordSchema),
  stats: automatabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(automatabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AutomatabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof automatabilityvaultizabilityAdminSummaryResponseSchema
>

export const automatabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatabilityvaultizabilityAdminActionSchema,
})
export type AutomatabilityvaultizabilityAdminActionRequest = z.infer<
  typeof automatabilityvaultizabilityAdminActionRequestSchema
>

export const automatabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: automatabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AutomatabilityvaultizabilityAdminActionResponse = z.infer<
  typeof automatabilityvaultizabilityAdminActionResponseSchema
>
