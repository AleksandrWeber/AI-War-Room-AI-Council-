import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const systematizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type SystematizabilityAdminDomain = z.infer<typeof systematizabilityAdminDomainSchema>

export const systematizabilityAdminRecordSchema = z.object({
  domain: systematizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SystematizabilityAdminRecord = z.infer<typeof systematizabilityAdminRecordSchema>

export const systematizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  systematizabilityPercent: z.number().min(0).max(100),
})
export type SystematizabilityAdminStats = z.infer<typeof systematizabilityAdminStatsSchema>

export const systematizabilityAdminActionSchema = z.enum(['refresh_systematizability_summary'])
export type SystematizabilityAdminAction = z.infer<typeof systematizabilityAdminActionSchema>

export const systematizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(systematizabilityAdminRecordSchema),
  stats: systematizabilityAdminStatsSchema,
  availableActions: z.array(systematizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SystematizabilityAdminSummaryResponse = z.infer<
  typeof systematizabilityAdminSummaryResponseSchema
>

export const systematizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: systematizabilityAdminActionSchema,
})
export type SystematizabilityAdminActionRequest = z.infer<
  typeof systematizabilityAdminActionRequestSchema
>

export const systematizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: systematizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: systematizabilityAdminStatsSchema.optional(),
})
export type SystematizabilityAdminActionResponse = z.infer<
  typeof systematizabilityAdminActionResponseSchema
>
