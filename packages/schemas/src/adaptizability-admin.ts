import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adaptizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type AdaptizabilityAdminDomain = z.infer<typeof adaptizabilityAdminDomainSchema>

export const adaptizabilityAdminRecordSchema = z.object({
  domain: adaptizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdaptizabilityAdminRecord = z.infer<typeof adaptizabilityAdminRecordSchema>

export const adaptizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adaptizabilityPercent: z.number().min(0).max(100),
})
export type AdaptizabilityAdminStats = z.infer<typeof adaptizabilityAdminStatsSchema>

export const adaptizabilityAdminActionSchema = z.enum(['refresh_adaptizability_summary'])
export type AdaptizabilityAdminAction = z.infer<typeof adaptizabilityAdminActionSchema>

export const adaptizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adaptizabilityAdminRecordSchema),
  stats: adaptizabilityAdminStatsSchema,
  availableActions: z.array(adaptizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdaptizabilityAdminSummaryResponse = z.infer<
  typeof adaptizabilityAdminSummaryResponseSchema
>

export const adaptizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptizabilityAdminActionSchema,
})
export type AdaptizabilityAdminActionRequest = z.infer<
  typeof adaptizabilityAdminActionRequestSchema
>

export const adaptizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adaptizabilityAdminStatsSchema.optional(),
})
export type AdaptizabilityAdminActionResponse = z.infer<
  typeof adaptizabilityAdminActionResponseSchema
>
