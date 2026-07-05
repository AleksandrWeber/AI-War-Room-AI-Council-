import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interchangeabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'idempotency_keys',
])
export type InterchangeabilityAdminDomain = z.infer<typeof interchangeabilityAdminDomainSchema>

export const interchangeabilityAdminRecordSchema = z.object({
  domain: interchangeabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InterchangeabilityAdminRecord = z.infer<typeof interchangeabilityAdminRecordSchema>

export const interchangeabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interchangeabilityPercent: z.number().min(0).max(100),
})
export type InterchangeabilityAdminStats = z.infer<typeof interchangeabilityAdminStatsSchema>

export const interchangeabilityAdminActionSchema = z.enum(['refresh_interchangeability_summary'])
export type InterchangeabilityAdminAction = z.infer<typeof interchangeabilityAdminActionSchema>

export const interchangeabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interchangeabilityAdminRecordSchema),
  stats: interchangeabilityAdminStatsSchema,
  availableActions: z.array(interchangeabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InterchangeabilityAdminSummaryResponse = z.infer<
  typeof interchangeabilityAdminSummaryResponseSchema
>

export const interchangeabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interchangeabilityAdminActionSchema,
})
export type InterchangeabilityAdminActionRequest = z.infer<
  typeof interchangeabilityAdminActionRequestSchema
>

export const interchangeabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interchangeabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interchangeabilityAdminStatsSchema.optional(),
})
export type InterchangeabilityAdminActionResponse = z.infer<
  typeof interchangeabilityAdminActionResponseSchema
>
