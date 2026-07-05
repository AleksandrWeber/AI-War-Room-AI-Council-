import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const gnoseizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type GnoseizabilityAdminDomain = z.infer<typeof gnoseizabilityAdminDomainSchema>

export const gnoseizabilityAdminRecordSchema = z.object({
  domain: gnoseizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GnoseizabilityAdminRecord = z.infer<typeof gnoseizabilityAdminRecordSchema>

export const gnoseizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  gnoseizabilityPercent: z.number().min(0).max(100),
})
export type GnoseizabilityAdminStats = z.infer<typeof gnoseizabilityAdminStatsSchema>

export const gnoseizabilityAdminActionSchema = z.enum(['refresh_gnoseizability_summary'])
export type GnoseizabilityAdminAction = z.infer<typeof gnoseizabilityAdminActionSchema>

export const gnoseizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(gnoseizabilityAdminRecordSchema),
  stats: gnoseizabilityAdminStatsSchema,
  availableActions: z.array(gnoseizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GnoseizabilityAdminSummaryResponse = z.infer<
  typeof gnoseizabilityAdminSummaryResponseSchema
>

export const gnoseizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: gnoseizabilityAdminActionSchema,
})
export type GnoseizabilityAdminActionRequest = z.infer<
  typeof gnoseizabilityAdminActionRequestSchema
>

export const gnoseizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: gnoseizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: gnoseizabilityAdminStatsSchema.optional(),
})
export type GnoseizabilityAdminActionResponse = z.infer<
  typeof gnoseizabilityAdminActionResponseSchema
>
