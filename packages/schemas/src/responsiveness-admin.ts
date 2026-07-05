import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const responsivenessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_meter_usage_reports',
])
export type ResponsivenessAdminDomain = z.infer<typeof responsivenessAdminDomainSchema>

export const responsivenessAdminRecordSchema = z.object({
  domain: responsivenessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ResponsivenessAdminRecord = z.infer<typeof responsivenessAdminRecordSchema>

export const responsivenessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  responsivenessPercent: z.number().min(0).max(100),
})
export type ResponsivenessAdminStats = z.infer<typeof responsivenessAdminStatsSchema>

export const responsivenessAdminActionSchema = z.enum(['refresh_responsiveness_summary'])
export type ResponsivenessAdminAction = z.infer<typeof responsivenessAdminActionSchema>

export const responsivenessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(responsivenessAdminRecordSchema),
  stats: responsivenessAdminStatsSchema,
  availableActions: z.array(responsivenessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ResponsivenessAdminSummaryResponse = z.infer<
  typeof responsivenessAdminSummaryResponseSchema
>

export const responsivenessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: responsivenessAdminActionSchema,
})
export type ResponsivenessAdminActionRequest = z.infer<
  typeof responsivenessAdminActionRequestSchema
>

export const responsivenessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: responsivenessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: responsivenessAdminStatsSchema.optional(),
})
export type ResponsivenessAdminActionResponse = z.infer<
  typeof responsivenessAdminActionResponseSchema
>
