import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const performanceAdminDomainSchema = z.enum([
  'completed_runs',
  'usage_events',
  'model_health_events',
  'pipeline_latency_events',
])
export type PerformanceAdminDomain = z.infer<
  typeof performanceAdminDomainSchema
>

export const performanceAdminRecordSchema = z.object({
  domain: performanceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PerformanceAdminRecord = z.infer<typeof performanceAdminRecordSchema>

export const performanceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  averageLatencyMs: z.number().nonnegative(),
  latencySignalPercent: z.number().min(0).max(100),
  slowestPipelinePhases: z
    .array(
      z.object({
        phase: nonEmptyStringSchema,
        durationMs: z.number().nonnegative(),
        runId: nonEmptyStringSchema.optional(),
      }),
    )
    .max(5)
    .default([]),
})
export type PerformanceAdminStats = z.infer<typeof performanceAdminStatsSchema>

export const performanceAdminActionSchema = z.enum(['refresh_performance_summary'])
export type PerformanceAdminAction = z.infer<
  typeof performanceAdminActionSchema
>

export const performanceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(performanceAdminRecordSchema),
  stats: performanceAdminStatsSchema,
  availableActions: z.array(performanceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PerformanceAdminSummaryResponse = z.infer<
  typeof performanceAdminSummaryResponseSchema
>

export const performanceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: performanceAdminActionSchema,
})
export type PerformanceAdminActionRequest = z.infer<
  typeof performanceAdminActionRequestSchema
>

export const performanceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: performanceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: performanceAdminStatsSchema.optional(),
})
export type PerformanceAdminActionResponse = z.infer<
  typeof performanceAdminActionResponseSchema
>
