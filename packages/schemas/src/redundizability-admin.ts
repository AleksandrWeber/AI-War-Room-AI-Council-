import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const redundizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type RedundizabilityAdminDomain = z.infer<typeof redundizabilityAdminDomainSchema>

export const redundizabilityAdminRecordSchema = z.object({
  domain: redundizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RedundizabilityAdminRecord = z.infer<typeof redundizabilityAdminRecordSchema>

export const redundizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  redundizabilityPercent: z.number().min(0).max(100),
})
export type RedundizabilityAdminStats = z.infer<typeof redundizabilityAdminStatsSchema>

export const redundizabilityAdminActionSchema = z.enum(['refresh_redundizability_summary'])
export type RedundizabilityAdminAction = z.infer<typeof redundizabilityAdminActionSchema>

export const redundizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(redundizabilityAdminRecordSchema),
  stats: redundizabilityAdminStatsSchema,
  availableActions: z.array(redundizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RedundizabilityAdminSummaryResponse = z.infer<
  typeof redundizabilityAdminSummaryResponseSchema
>

export const redundizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: redundizabilityAdminActionSchema,
})
export type RedundizabilityAdminActionRequest = z.infer<
  typeof redundizabilityAdminActionRequestSchema
>

export const redundizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: redundizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: redundizabilityAdminStatsSchema.optional(),
})
export type RedundizabilityAdminActionResponse = z.infer<
  typeof redundizabilityAdminActionResponseSchema
>
