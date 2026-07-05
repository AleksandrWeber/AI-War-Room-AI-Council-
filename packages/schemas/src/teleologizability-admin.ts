import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const teleologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type TeleologizabilityAdminDomain = z.infer<typeof teleologizabilityAdminDomainSchema>

export const teleologizabilityAdminRecordSchema = z.object({
  domain: teleologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TeleologizabilityAdminRecord = z.infer<typeof teleologizabilityAdminRecordSchema>

export const teleologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  teleologizabilityPercent: z.number().min(0).max(100),
})
export type TeleologizabilityAdminStats = z.infer<typeof teleologizabilityAdminStatsSchema>

export const teleologizabilityAdminActionSchema = z.enum(['refresh_teleologizability_summary'])
export type TeleologizabilityAdminAction = z.infer<typeof teleologizabilityAdminActionSchema>

export const teleologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(teleologizabilityAdminRecordSchema),
  stats: teleologizabilityAdminStatsSchema,
  availableActions: z.array(teleologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TeleologizabilityAdminSummaryResponse = z.infer<
  typeof teleologizabilityAdminSummaryResponseSchema
>

export const teleologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: teleologizabilityAdminActionSchema,
})
export type TeleologizabilityAdminActionRequest = z.infer<
  typeof teleologizabilityAdminActionRequestSchema
>

export const teleologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: teleologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: teleologizabilityAdminStatsSchema.optional(),
})
export type TeleologizabilityAdminActionResponse = z.infer<
  typeof teleologizabilityAdminActionResponseSchema
>
