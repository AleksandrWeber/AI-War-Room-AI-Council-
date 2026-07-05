import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const traceabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'usage_events',
])
export type TraceabilityAdminDomain = z.infer<
  typeof traceabilityAdminDomainSchema
>

export const traceabilityAdminRecordSchema = z.object({
  domain: traceabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TraceabilityAdminRecord = z.infer<
  typeof traceabilityAdminRecordSchema
>

export const traceabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  traceabilityPercent: z.number().min(0).max(100),
})
export type TraceabilityAdminStats = z.infer<
  typeof traceabilityAdminStatsSchema
>

export const traceabilityAdminActionSchema = z.enum([
  'refresh_traceability_summary',
])
export type TraceabilityAdminAction = z.infer<
  typeof traceabilityAdminActionSchema
>

export const traceabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(traceabilityAdminRecordSchema),
  stats: traceabilityAdminStatsSchema,
  availableActions: z.array(traceabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TraceabilityAdminSummaryResponse = z.infer<
  typeof traceabilityAdminSummaryResponseSchema
>

export const traceabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceabilityAdminActionSchema,
})
export type TraceabilityAdminActionRequest = z.infer<
  typeof traceabilityAdminActionRequestSchema
>

export const traceabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: traceabilityAdminStatsSchema.optional(),
})
export type TraceabilityAdminActionResponse = z.infer<
  typeof traceabilityAdminActionResponseSchema
>
