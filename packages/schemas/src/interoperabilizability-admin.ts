import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interoperabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type InteroperabilizabilityAdminDomain = z.infer<typeof interoperabilizabilityAdminDomainSchema>

export const interoperabilizabilityAdminRecordSchema = z.object({
  domain: interoperabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InteroperabilizabilityAdminRecord = z.infer<typeof interoperabilizabilityAdminRecordSchema>

export const interoperabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interoperabilizabilityPercent: z.number().min(0).max(100),
})
export type InteroperabilizabilityAdminStats = z.infer<typeof interoperabilizabilityAdminStatsSchema>

export const interoperabilizabilityAdminActionSchema = z.enum(['refresh_interoperabilizability_summary'])
export type InteroperabilizabilityAdminAction = z.infer<typeof interoperabilizabilityAdminActionSchema>

export const interoperabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interoperabilizabilityAdminRecordSchema),
  stats: interoperabilizabilityAdminStatsSchema,
  availableActions: z.array(interoperabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InteroperabilizabilityAdminSummaryResponse = z.infer<
  typeof interoperabilizabilityAdminSummaryResponseSchema
>

export const interoperabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interoperabilizabilityAdminActionSchema,
})
export type InteroperabilizabilityAdminActionRequest = z.infer<
  typeof interoperabilizabilityAdminActionRequestSchema
>

export const interoperabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interoperabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interoperabilizabilityAdminStatsSchema.optional(),
})
export type InteroperabilizabilityAdminActionResponse = z.infer<
  typeof interoperabilizabilityAdminActionResponseSchema
>
