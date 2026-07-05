import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adaptabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_notifications',
])
export type AdaptabilityAdminDomain = z.infer<typeof adaptabilityAdminDomainSchema>

export const adaptabilityAdminRecordSchema = z.object({
  domain: adaptabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdaptabilityAdminRecord = z.infer<typeof adaptabilityAdminRecordSchema>

export const adaptabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adaptabilityPercent: z.number().min(0).max(100),
})
export type AdaptabilityAdminStats = z.infer<typeof adaptabilityAdminStatsSchema>

export const adaptabilityAdminActionSchema = z.enum(['refresh_adaptability_summary'])
export type AdaptabilityAdminAction = z.infer<typeof adaptabilityAdminActionSchema>

export const adaptabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adaptabilityAdminRecordSchema),
  stats: adaptabilityAdminStatsSchema,
  availableActions: z.array(adaptabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdaptabilityAdminSummaryResponse = z.infer<
  typeof adaptabilityAdminSummaryResponseSchema
>

export const adaptabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptabilityAdminActionSchema,
})
export type AdaptabilityAdminActionRequest = z.infer<
  typeof adaptabilityAdminActionRequestSchema
>

export const adaptabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adaptabilityAdminStatsSchema.optional(),
})
export type AdaptabilityAdminActionResponse = z.infer<
  typeof adaptabilityAdminActionResponseSchema
>
