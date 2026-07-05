import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deliverabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type DeliverabilityAdminDomain = z.infer<typeof deliverabilityAdminDomainSchema>

export const deliverabilityAdminRecordSchema = z.object({
  domain: deliverabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeliverabilityAdminRecord = z.infer<typeof deliverabilityAdminRecordSchema>

export const deliverabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deliverabilityPercent: z.number().min(0).max(100),
})
export type DeliverabilityAdminStats = z.infer<typeof deliverabilityAdminStatsSchema>

export const deliverabilityAdminActionSchema = z.enum(['refresh_deliverability_summary'])
export type DeliverabilityAdminAction = z.infer<typeof deliverabilityAdminActionSchema>

export const deliverabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deliverabilityAdminRecordSchema),
  stats: deliverabilityAdminStatsSchema,
  availableActions: z.array(deliverabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeliverabilityAdminSummaryResponse = z.infer<
  typeof deliverabilityAdminSummaryResponseSchema
>

export const deliverabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deliverabilityAdminActionSchema,
})
export type DeliverabilityAdminActionRequest = z.infer<
  typeof deliverabilityAdminActionRequestSchema
>

export const deliverabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deliverabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deliverabilityAdminStatsSchema.optional(),
})
export type DeliverabilityAdminActionResponse = z.infer<
  typeof deliverabilityAdminActionResponseSchema
>
