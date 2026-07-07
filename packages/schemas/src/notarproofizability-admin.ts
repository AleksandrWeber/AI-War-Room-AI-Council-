import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const notarproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type NotarproofizabilityAdminDomain = z.infer<typeof notarproofizabilityAdminDomainSchema>

export const notarproofizabilityAdminRecordSchema = z.object({
  domain: notarproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NotarproofizabilityAdminRecord = z.infer<typeof notarproofizabilityAdminRecordSchema>

export const notarproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  notarproofizabilityPercent: z.number().min(0).max(100),
})
export type NotarproofizabilityAdminStats = z.infer<typeof notarproofizabilityAdminStatsSchema>

export const notarproofizabilityAdminActionSchema = z.enum(['refresh_notarproofizability_summary'])
export type NotarproofizabilityAdminAction = z.infer<typeof notarproofizabilityAdminActionSchema>

export const notarproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(notarproofizabilityAdminRecordSchema),
  stats: notarproofizabilityAdminStatsSchema,
  availableActions: z.array(notarproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NotarproofizabilityAdminSummaryResponse = z.infer<
  typeof notarproofizabilityAdminSummaryResponseSchema
>

export const notarproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarproofizabilityAdminActionSchema,
})
export type NotarproofizabilityAdminActionRequest = z.infer<
  typeof notarproofizabilityAdminActionRequestSchema
>

export const notarproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: notarproofizabilityAdminStatsSchema.optional(),
})
export type NotarproofizabilityAdminActionResponse = z.infer<
  typeof notarproofizabilityAdminActionResponseSchema
>
