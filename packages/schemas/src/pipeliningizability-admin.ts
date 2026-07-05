import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const pipeliningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type PipeliningizabilityAdminDomain = z.infer<typeof pipeliningizabilityAdminDomainSchema>

export const pipeliningizabilityAdminRecordSchema = z.object({
  domain: pipeliningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PipeliningizabilityAdminRecord = z.infer<typeof pipeliningizabilityAdminRecordSchema>

export const pipeliningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  pipeliningizabilityPercent: z.number().min(0).max(100),
})
export type PipeliningizabilityAdminStats = z.infer<typeof pipeliningizabilityAdminStatsSchema>

export const pipeliningizabilityAdminActionSchema = z.enum(['refresh_pipeliningizability_summary'])
export type PipeliningizabilityAdminAction = z.infer<typeof pipeliningizabilityAdminActionSchema>

export const pipeliningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(pipeliningizabilityAdminRecordSchema),
  stats: pipeliningizabilityAdminStatsSchema,
  availableActions: z.array(pipeliningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PipeliningizabilityAdminSummaryResponse = z.infer<
  typeof pipeliningizabilityAdminSummaryResponseSchema
>

export const pipeliningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pipeliningizabilityAdminActionSchema,
})
export type PipeliningizabilityAdminActionRequest = z.infer<
  typeof pipeliningizabilityAdminActionRequestSchema
>

export const pipeliningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pipeliningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: pipeliningizabilityAdminStatsSchema.optional(),
})
export type PipeliningizabilityAdminActionResponse = z.infer<
  typeof pipeliningizabilityAdminActionResponseSchema
>
