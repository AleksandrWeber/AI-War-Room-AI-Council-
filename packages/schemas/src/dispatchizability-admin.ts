import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dispatchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type DispatchizabilityAdminDomain = z.infer<typeof dispatchizabilityAdminDomainSchema>

export const dispatchizabilityAdminRecordSchema = z.object({
  domain: dispatchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DispatchizabilityAdminRecord = z.infer<typeof dispatchizabilityAdminRecordSchema>

export const dispatchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dispatchizabilityPercent: z.number().min(0).max(100),
})
export type DispatchizabilityAdminStats = z.infer<typeof dispatchizabilityAdminStatsSchema>

export const dispatchizabilityAdminActionSchema = z.enum(['refresh_dispatchizability_summary'])
export type DispatchizabilityAdminAction = z.infer<typeof dispatchizabilityAdminActionSchema>

export const dispatchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dispatchizabilityAdminRecordSchema),
  stats: dispatchizabilityAdminStatsSchema,
  availableActions: z.array(dispatchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DispatchizabilityAdminSummaryResponse = z.infer<
  typeof dispatchizabilityAdminSummaryResponseSchema
>

export const dispatchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dispatchizabilityAdminActionSchema,
})
export type DispatchizabilityAdminActionRequest = z.infer<
  typeof dispatchizabilityAdminActionRequestSchema
>

export const dispatchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dispatchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dispatchizabilityAdminStatsSchema.optional(),
})
export type DispatchizabilityAdminActionResponse = z.infer<
  typeof dispatchizabilityAdminActionResponseSchema
>
