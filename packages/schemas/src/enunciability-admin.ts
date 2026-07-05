import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const enunciabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type EnunciabilityAdminDomain = z.infer<typeof enunciabilityAdminDomainSchema>

export const enunciabilityAdminRecordSchema = z.object({
  domain: enunciabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EnunciabilityAdminRecord = z.infer<typeof enunciabilityAdminRecordSchema>

export const enunciabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  enunciabilityPercent: z.number().min(0).max(100),
})
export type EnunciabilityAdminStats = z.infer<typeof enunciabilityAdminStatsSchema>

export const enunciabilityAdminActionSchema = z.enum(['refresh_enunciability_summary'])
export type EnunciabilityAdminAction = z.infer<typeof enunciabilityAdminActionSchema>

export const enunciabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(enunciabilityAdminRecordSchema),
  stats: enunciabilityAdminStatsSchema,
  availableActions: z.array(enunciabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EnunciabilityAdminSummaryResponse = z.infer<
  typeof enunciabilityAdminSummaryResponseSchema
>

export const enunciabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: enunciabilityAdminActionSchema,
})
export type EnunciabilityAdminActionRequest = z.infer<
  typeof enunciabilityAdminActionRequestSchema
>

export const enunciabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: enunciabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: enunciabilityAdminStatsSchema.optional(),
})
export type EnunciabilityAdminActionResponse = z.infer<
  typeof enunciabilityAdminActionResponseSchema
>
