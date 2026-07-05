import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const benchmarkizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type BenchmarkizabilityAdminDomain = z.infer<typeof benchmarkizabilityAdminDomainSchema>

export const benchmarkizabilityAdminRecordSchema = z.object({
  domain: benchmarkizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BenchmarkizabilityAdminRecord = z.infer<typeof benchmarkizabilityAdminRecordSchema>

export const benchmarkizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  benchmarkizabilityPercent: z.number().min(0).max(100),
})
export type BenchmarkizabilityAdminStats = z.infer<typeof benchmarkizabilityAdminStatsSchema>

export const benchmarkizabilityAdminActionSchema = z.enum(['refresh_benchmarkizability_summary'])
export type BenchmarkizabilityAdminAction = z.infer<typeof benchmarkizabilityAdminActionSchema>

export const benchmarkizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(benchmarkizabilityAdminRecordSchema),
  stats: benchmarkizabilityAdminStatsSchema,
  availableActions: z.array(benchmarkizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BenchmarkizabilityAdminSummaryResponse = z.infer<
  typeof benchmarkizabilityAdminSummaryResponseSchema
>

export const benchmarkizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: benchmarkizabilityAdminActionSchema,
})
export type BenchmarkizabilityAdminActionRequest = z.infer<
  typeof benchmarkizabilityAdminActionRequestSchema
>

export const benchmarkizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: benchmarkizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: benchmarkizabilityAdminStatsSchema.optional(),
})
export type BenchmarkizabilityAdminActionResponse = z.infer<
  typeof benchmarkizabilityAdminActionResponseSchema
>
