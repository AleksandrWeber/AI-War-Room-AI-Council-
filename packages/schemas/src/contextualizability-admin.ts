import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const contextualizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ContextualizabilityAdminDomain = z.infer<typeof contextualizabilityAdminDomainSchema>

export const contextualizabilityAdminRecordSchema = z.object({
  domain: contextualizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ContextualizabilityAdminRecord = z.infer<typeof contextualizabilityAdminRecordSchema>

export const contextualizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  contextualizabilityPercent: z.number().min(0).max(100),
})
export type ContextualizabilityAdminStats = z.infer<typeof contextualizabilityAdminStatsSchema>

export const contextualizabilityAdminActionSchema = z.enum(['refresh_contextualizability_summary'])
export type ContextualizabilityAdminAction = z.infer<typeof contextualizabilityAdminActionSchema>

export const contextualizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(contextualizabilityAdminRecordSchema),
  stats: contextualizabilityAdminStatsSchema,
  availableActions: z.array(contextualizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ContextualizabilityAdminSummaryResponse = z.infer<
  typeof contextualizabilityAdminSummaryResponseSchema
>

export const contextualizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: contextualizabilityAdminActionSchema,
})
export type ContextualizabilityAdminActionRequest = z.infer<
  typeof contextualizabilityAdminActionRequestSchema
>

export const contextualizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: contextualizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: contextualizabilityAdminStatsSchema.optional(),
})
export type ContextualizabilityAdminActionResponse = z.infer<
  typeof contextualizabilityAdminActionResponseSchema
>
