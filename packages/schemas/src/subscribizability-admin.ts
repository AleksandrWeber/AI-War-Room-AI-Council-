import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const subscribizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type SubscribizabilityAdminDomain = z.infer<typeof subscribizabilityAdminDomainSchema>

export const subscribizabilityAdminRecordSchema = z.object({
  domain: subscribizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SubscribizabilityAdminRecord = z.infer<typeof subscribizabilityAdminRecordSchema>

export const subscribizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  subscribizabilityPercent: z.number().min(0).max(100),
})
export type SubscribizabilityAdminStats = z.infer<typeof subscribizabilityAdminStatsSchema>

export const subscribizabilityAdminActionSchema = z.enum(['refresh_subscribizability_summary'])
export type SubscribizabilityAdminAction = z.infer<typeof subscribizabilityAdminActionSchema>

export const subscribizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(subscribizabilityAdminRecordSchema),
  stats: subscribizabilityAdminStatsSchema,
  availableActions: z.array(subscribizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SubscribizabilityAdminSummaryResponse = z.infer<
  typeof subscribizabilityAdminSummaryResponseSchema
>

export const subscribizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: subscribizabilityAdminActionSchema,
})
export type SubscribizabilityAdminActionRequest = z.infer<
  typeof subscribizabilityAdminActionRequestSchema
>

export const subscribizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: subscribizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: subscribizabilityAdminStatsSchema.optional(),
})
export type SubscribizabilityAdminActionResponse = z.infer<
  typeof subscribizabilityAdminActionResponseSchema
>
