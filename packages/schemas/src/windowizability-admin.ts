import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const windowizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type WindowizabilityAdminDomain = z.infer<typeof windowizabilityAdminDomainSchema>

export const windowizabilityAdminRecordSchema = z.object({
  domain: windowizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WindowizabilityAdminRecord = z.infer<typeof windowizabilityAdminRecordSchema>

export const windowizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  windowizabilityPercent: z.number().min(0).max(100),
})
export type WindowizabilityAdminStats = z.infer<typeof windowizabilityAdminStatsSchema>

export const windowizabilityAdminActionSchema = z.enum(['refresh_windowizability_summary'])
export type WindowizabilityAdminAction = z.infer<typeof windowizabilityAdminActionSchema>

export const windowizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(windowizabilityAdminRecordSchema),
  stats: windowizabilityAdminStatsSchema,
  availableActions: z.array(windowizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WindowizabilityAdminSummaryResponse = z.infer<
  typeof windowizabilityAdminSummaryResponseSchema
>

export const windowizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: windowizabilityAdminActionSchema,
})
export type WindowizabilityAdminActionRequest = z.infer<
  typeof windowizabilityAdminActionRequestSchema
>

export const windowizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: windowizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: windowizabilityAdminStatsSchema.optional(),
})
export type WindowizabilityAdminActionResponse = z.infer<
  typeof windowizabilityAdminActionResponseSchema
>
