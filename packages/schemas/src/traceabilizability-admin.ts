import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const traceabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type TraceabilizabilityAdminDomain = z.infer<typeof traceabilizabilityAdminDomainSchema>

export const traceabilizabilityAdminRecordSchema = z.object({
  domain: traceabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TraceabilizabilityAdminRecord = z.infer<typeof traceabilizabilityAdminRecordSchema>

export const traceabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  traceabilizabilityPercent: z.number().min(0).max(100),
})
export type TraceabilizabilityAdminStats = z.infer<typeof traceabilizabilityAdminStatsSchema>

export const traceabilizabilityAdminActionSchema = z.enum(['refresh_traceabilizability_summary'])
export type TraceabilizabilityAdminAction = z.infer<typeof traceabilizabilityAdminActionSchema>

export const traceabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(traceabilizabilityAdminRecordSchema),
  stats: traceabilizabilityAdminStatsSchema,
  availableActions: z.array(traceabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TraceabilizabilityAdminSummaryResponse = z.infer<
  typeof traceabilizabilityAdminSummaryResponseSchema
>

export const traceabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceabilizabilityAdminActionSchema,
})
export type TraceabilizabilityAdminActionRequest = z.infer<
  typeof traceabilizabilityAdminActionRequestSchema
>

export const traceabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: traceabilizabilityAdminStatsSchema.optional(),
})
export type TraceabilizabilityAdminActionResponse = z.infer<
  typeof traceabilizabilityAdminActionResponseSchema
>
