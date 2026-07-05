import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const publishizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type PublishizabilityAdminDomain = z.infer<typeof publishizabilityAdminDomainSchema>

export const publishizabilityAdminRecordSchema = z.object({
  domain: publishizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PublishizabilityAdminRecord = z.infer<typeof publishizabilityAdminRecordSchema>

export const publishizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  publishizabilityPercent: z.number().min(0).max(100),
})
export type PublishizabilityAdminStats = z.infer<typeof publishizabilityAdminStatsSchema>

export const publishizabilityAdminActionSchema = z.enum(['refresh_publishizability_summary'])
export type PublishizabilityAdminAction = z.infer<typeof publishizabilityAdminActionSchema>

export const publishizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(publishizabilityAdminRecordSchema),
  stats: publishizabilityAdminStatsSchema,
  availableActions: z.array(publishizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PublishizabilityAdminSummaryResponse = z.infer<
  typeof publishizabilityAdminSummaryResponseSchema
>

export const publishizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: publishizabilityAdminActionSchema,
})
export type PublishizabilityAdminActionRequest = z.infer<
  typeof publishizabilityAdminActionRequestSchema
>

export const publishizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: publishizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: publishizabilityAdminStatsSchema.optional(),
})
export type PublishizabilityAdminActionResponse = z.infer<
  typeof publishizabilityAdminActionResponseSchema
>
