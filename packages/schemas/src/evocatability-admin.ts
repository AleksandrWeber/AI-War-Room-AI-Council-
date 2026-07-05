import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evocatabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type EvocatabilityAdminDomain = z.infer<typeof evocatabilityAdminDomainSchema>

export const evocatabilityAdminRecordSchema = z.object({
  domain: evocatabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvocatabilityAdminRecord = z.infer<typeof evocatabilityAdminRecordSchema>

export const evocatabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evocatabilityPercent: z.number().min(0).max(100),
})
export type EvocatabilityAdminStats = z.infer<typeof evocatabilityAdminStatsSchema>

export const evocatabilityAdminActionSchema = z.enum(['refresh_evocatability_summary'])
export type EvocatabilityAdminAction = z.infer<typeof evocatabilityAdminActionSchema>

export const evocatabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evocatabilityAdminRecordSchema),
  stats: evocatabilityAdminStatsSchema,
  availableActions: z.array(evocatabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvocatabilityAdminSummaryResponse = z.infer<
  typeof evocatabilityAdminSummaryResponseSchema
>

export const evocatabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evocatabilityAdminActionSchema,
})
export type EvocatabilityAdminActionRequest = z.infer<
  typeof evocatabilityAdminActionRequestSchema
>

export const evocatabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evocatabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evocatabilityAdminStatsSchema.optional(),
})
export type EvocatabilityAdminActionResponse = z.infer<
  typeof evocatabilityAdminActionResponseSchema
>
