import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const telemetryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TelemetryizabilityAdminDomain = z.infer<typeof telemetryizabilityAdminDomainSchema>

export const telemetryizabilityAdminRecordSchema = z.object({
  domain: telemetryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TelemetryizabilityAdminRecord = z.infer<typeof telemetryizabilityAdminRecordSchema>

export const telemetryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  telemetryizabilityPercent: z.number().min(0).max(100),
})
export type TelemetryizabilityAdminStats = z.infer<typeof telemetryizabilityAdminStatsSchema>

export const telemetryizabilityAdminActionSchema = z.enum(['refresh_telemetryizability_summary'])
export type TelemetryizabilityAdminAction = z.infer<typeof telemetryizabilityAdminActionSchema>

export const telemetryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(telemetryizabilityAdminRecordSchema),
  stats: telemetryizabilityAdminStatsSchema,
  availableActions: z.array(telemetryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TelemetryizabilityAdminSummaryResponse = z.infer<
  typeof telemetryizabilityAdminSummaryResponseSchema
>

export const telemetryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: telemetryizabilityAdminActionSchema,
})
export type TelemetryizabilityAdminActionRequest = z.infer<
  typeof telemetryizabilityAdminActionRequestSchema
>

export const telemetryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: telemetryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: telemetryizabilityAdminStatsSchema.optional(),
})
export type TelemetryizabilityAdminActionResponse = z.infer<
  typeof telemetryizabilityAdminActionResponseSchema
>
