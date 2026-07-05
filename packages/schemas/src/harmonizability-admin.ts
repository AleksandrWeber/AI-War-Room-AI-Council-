import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const harmonizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type HarmonizabilityAdminDomain = z.infer<typeof harmonizabilityAdminDomainSchema>

export const harmonizabilityAdminRecordSchema = z.object({
  domain: harmonizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HarmonizabilityAdminRecord = z.infer<typeof harmonizabilityAdminRecordSchema>

export const harmonizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  harmonizabilityPercent: z.number().min(0).max(100),
})
export type HarmonizabilityAdminStats = z.infer<typeof harmonizabilityAdminStatsSchema>

export const harmonizabilityAdminActionSchema = z.enum(['refresh_harmonizability_summary'])
export type HarmonizabilityAdminAction = z.infer<typeof harmonizabilityAdminActionSchema>

export const harmonizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(harmonizabilityAdminRecordSchema),
  stats: harmonizabilityAdminStatsSchema,
  availableActions: z.array(harmonizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HarmonizabilityAdminSummaryResponse = z.infer<
  typeof harmonizabilityAdminSummaryResponseSchema
>

export const harmonizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: harmonizabilityAdminActionSchema,
})
export type HarmonizabilityAdminActionRequest = z.infer<
  typeof harmonizabilityAdminActionRequestSchema
>

export const harmonizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: harmonizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: harmonizabilityAdminStatsSchema.optional(),
})
export type HarmonizabilityAdminActionResponse = z.infer<
  typeof harmonizabilityAdminActionResponseSchema
>
