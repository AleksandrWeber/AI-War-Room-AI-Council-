import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interpolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type InterpolizabilityAdminDomain = z.infer<typeof interpolizabilityAdminDomainSchema>

export const interpolizabilityAdminRecordSchema = z.object({
  domain: interpolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InterpolizabilityAdminRecord = z.infer<typeof interpolizabilityAdminRecordSchema>

export const interpolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interpolizabilityPercent: z.number().min(0).max(100),
})
export type InterpolizabilityAdminStats = z.infer<typeof interpolizabilityAdminStatsSchema>

export const interpolizabilityAdminActionSchema = z.enum(['refresh_interpolizability_summary'])
export type InterpolizabilityAdminAction = z.infer<typeof interpolizabilityAdminActionSchema>

export const interpolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interpolizabilityAdminRecordSchema),
  stats: interpolizabilityAdminStatsSchema,
  availableActions: z.array(interpolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InterpolizabilityAdminSummaryResponse = z.infer<
  typeof interpolizabilityAdminSummaryResponseSchema
>

export const interpolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interpolizabilityAdminActionSchema,
})
export type InterpolizabilityAdminActionRequest = z.infer<
  typeof interpolizabilityAdminActionRequestSchema
>

export const interpolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interpolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interpolizabilityAdminStatsSchema.optional(),
})
export type InterpolizabilityAdminActionResponse = z.infer<
  typeof interpolizabilityAdminActionResponseSchema
>
