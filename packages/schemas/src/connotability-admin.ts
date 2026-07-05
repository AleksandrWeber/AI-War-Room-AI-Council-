import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const connotabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type ConnotabilityAdminDomain = z.infer<typeof connotabilityAdminDomainSchema>

export const connotabilityAdminRecordSchema = z.object({
  domain: connotabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConnotabilityAdminRecord = z.infer<typeof connotabilityAdminRecordSchema>

export const connotabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  connotabilityPercent: z.number().min(0).max(100),
})
export type ConnotabilityAdminStats = z.infer<typeof connotabilityAdminStatsSchema>

export const connotabilityAdminActionSchema = z.enum(['refresh_connotability_summary'])
export type ConnotabilityAdminAction = z.infer<typeof connotabilityAdminActionSchema>

export const connotabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(connotabilityAdminRecordSchema),
  stats: connotabilityAdminStatsSchema,
  availableActions: z.array(connotabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConnotabilityAdminSummaryResponse = z.infer<
  typeof connotabilityAdminSummaryResponseSchema
>

export const connotabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connotabilityAdminActionSchema,
})
export type ConnotabilityAdminActionRequest = z.infer<
  typeof connotabilityAdminActionRequestSchema
>

export const connotabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: connotabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: connotabilityAdminStatsSchema.optional(),
})
export type ConnotabilityAdminActionResponse = z.infer<
  typeof connotabilityAdminActionResponseSchema
>
