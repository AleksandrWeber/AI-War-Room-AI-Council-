import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deallocationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type DeallocationizabilityAdminDomain = z.infer<typeof deallocationizabilityAdminDomainSchema>

export const deallocationizabilityAdminRecordSchema = z.object({
  domain: deallocationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeallocationizabilityAdminRecord = z.infer<typeof deallocationizabilityAdminRecordSchema>

export const deallocationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deallocationizabilityPercent: z.number().min(0).max(100),
})
export type DeallocationizabilityAdminStats = z.infer<typeof deallocationizabilityAdminStatsSchema>

export const deallocationizabilityAdminActionSchema = z.enum(['refresh_deallocationizability_summary'])
export type DeallocationizabilityAdminAction = z.infer<typeof deallocationizabilityAdminActionSchema>

export const deallocationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deallocationizabilityAdminRecordSchema),
  stats: deallocationizabilityAdminStatsSchema,
  availableActions: z.array(deallocationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeallocationizabilityAdminSummaryResponse = z.infer<
  typeof deallocationizabilityAdminSummaryResponseSchema
>

export const deallocationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deallocationizabilityAdminActionSchema,
})
export type DeallocationizabilityAdminActionRequest = z.infer<
  typeof deallocationizabilityAdminActionRequestSchema
>

export const deallocationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deallocationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deallocationizabilityAdminStatsSchema.optional(),
})
export type DeallocationizabilityAdminActionResponse = z.infer<
  typeof deallocationizabilityAdminActionResponseSchema
>
