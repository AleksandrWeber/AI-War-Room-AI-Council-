import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ordinarizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type OrdinarizabilityAdminDomain = z.infer<typeof ordinarizabilityAdminDomainSchema>

export const ordinarizabilityAdminRecordSchema = z.object({
  domain: ordinarizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrdinarizabilityAdminRecord = z.infer<typeof ordinarizabilityAdminRecordSchema>

export const ordinarizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ordinarizabilityPercent: z.number().min(0).max(100),
})
export type OrdinarizabilityAdminStats = z.infer<typeof ordinarizabilityAdminStatsSchema>

export const ordinarizabilityAdminActionSchema = z.enum(['refresh_ordinarizability_summary'])
export type OrdinarizabilityAdminAction = z.infer<typeof ordinarizabilityAdminActionSchema>

export const ordinarizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ordinarizabilityAdminRecordSchema),
  stats: ordinarizabilityAdminStatsSchema,
  availableActions: z.array(ordinarizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrdinarizabilityAdminSummaryResponse = z.infer<
  typeof ordinarizabilityAdminSummaryResponseSchema
>

export const ordinarizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ordinarizabilityAdminActionSchema,
})
export type OrdinarizabilityAdminActionRequest = z.infer<
  typeof ordinarizabilityAdminActionRequestSchema
>

export const ordinarizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ordinarizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ordinarizabilityAdminStatsSchema.optional(),
})
export type OrdinarizabilityAdminActionResponse = z.infer<
  typeof ordinarizabilityAdminActionResponseSchema
>
