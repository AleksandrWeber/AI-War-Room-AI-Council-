import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const optimizationAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'model_health_events',
])
export type OptimizationAdminDomain = z.infer<
  typeof optimizationAdminDomainSchema
>

export const optimizationAdminRecordSchema = z.object({
  domain: optimizationAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OptimizationAdminRecord = z.infer<
  typeof optimizationAdminRecordSchema
>

export const optimizationAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  optimizationPercent: z.number().min(0).max(100),
})
export type OptimizationAdminStats = z.infer<
  typeof optimizationAdminStatsSchema
>

export const optimizationAdminActionSchema = z.enum([
  'refresh_optimization_summary',
])
export type OptimizationAdminAction = z.infer<
  typeof optimizationAdminActionSchema
>

export const optimizationAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(optimizationAdminRecordSchema),
  stats: optimizationAdminStatsSchema,
  availableActions: z.array(optimizationAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OptimizationAdminSummaryResponse = z.infer<
  typeof optimizationAdminSummaryResponseSchema
>

export const optimizationAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: optimizationAdminActionSchema,
})
export type OptimizationAdminActionRequest = z.infer<
  typeof optimizationAdminActionRequestSchema
>

export const optimizationAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: optimizationAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: optimizationAdminStatsSchema.optional(),
})
export type OptimizationAdminActionResponse = z.infer<
  typeof optimizationAdminActionResponseSchema
>
