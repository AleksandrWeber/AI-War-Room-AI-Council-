import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const rhetorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type RhetorizabilityAdminDomain = z.infer<typeof rhetorizabilityAdminDomainSchema>

export const rhetorizabilityAdminRecordSchema = z.object({
  domain: rhetorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RhetorizabilityAdminRecord = z.infer<typeof rhetorizabilityAdminRecordSchema>

export const rhetorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  rhetorizabilityPercent: z.number().min(0).max(100),
})
export type RhetorizabilityAdminStats = z.infer<typeof rhetorizabilityAdminStatsSchema>

export const rhetorizabilityAdminActionSchema = z.enum(['refresh_rhetorizability_summary'])
export type RhetorizabilityAdminAction = z.infer<typeof rhetorizabilityAdminActionSchema>

export const rhetorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(rhetorizabilityAdminRecordSchema),
  stats: rhetorizabilityAdminStatsSchema,
  availableActions: z.array(rhetorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RhetorizabilityAdminSummaryResponse = z.infer<
  typeof rhetorizabilityAdminSummaryResponseSchema
>

export const rhetorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rhetorizabilityAdminActionSchema,
})
export type RhetorizabilityAdminActionRequest = z.infer<
  typeof rhetorizabilityAdminActionRequestSchema
>

export const rhetorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rhetorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: rhetorizabilityAdminStatsSchema.optional(),
})
export type RhetorizabilityAdminActionResponse = z.infer<
  typeof rhetorizabilityAdminActionResponseSchema
>
