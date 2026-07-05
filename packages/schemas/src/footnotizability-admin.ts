import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const footnotizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type FootnotizabilityAdminDomain = z.infer<typeof footnotizabilityAdminDomainSchema>

export const footnotizabilityAdminRecordSchema = z.object({
  domain: footnotizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FootnotizabilityAdminRecord = z.infer<typeof footnotizabilityAdminRecordSchema>

export const footnotizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  footnotizabilityPercent: z.number().min(0).max(100),
})
export type FootnotizabilityAdminStats = z.infer<typeof footnotizabilityAdminStatsSchema>

export const footnotizabilityAdminActionSchema = z.enum(['refresh_footnotizability_summary'])
export type FootnotizabilityAdminAction = z.infer<typeof footnotizabilityAdminActionSchema>

export const footnotizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(footnotizabilityAdminRecordSchema),
  stats: footnotizabilityAdminStatsSchema,
  availableActions: z.array(footnotizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FootnotizabilityAdminSummaryResponse = z.infer<
  typeof footnotizabilityAdminSummaryResponseSchema
>

export const footnotizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: footnotizabilityAdminActionSchema,
})
export type FootnotizabilityAdminActionRequest = z.infer<
  typeof footnotizabilityAdminActionRequestSchema
>

export const footnotizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: footnotizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: footnotizabilityAdminStatsSchema.optional(),
})
export type FootnotizabilityAdminActionResponse = z.infer<
  typeof footnotizabilityAdminActionResponseSchema
>
