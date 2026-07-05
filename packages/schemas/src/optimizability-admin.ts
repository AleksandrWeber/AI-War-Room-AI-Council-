import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const optimizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type OptimizabilityAdminDomain = z.infer<typeof optimizabilityAdminDomainSchema>

export const optimizabilityAdminRecordSchema = z.object({
  domain: optimizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OptimizabilityAdminRecord = z.infer<typeof optimizabilityAdminRecordSchema>

export const optimizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  optimizabilityPercent: z.number().min(0).max(100),
})
export type OptimizabilityAdminStats = z.infer<typeof optimizabilityAdminStatsSchema>

export const optimizabilityAdminActionSchema = z.enum(['refresh_optimizability_summary'])
export type OptimizabilityAdminAction = z.infer<typeof optimizabilityAdminActionSchema>

export const optimizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(optimizabilityAdminRecordSchema),
  stats: optimizabilityAdminStatsSchema,
  availableActions: z.array(optimizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OptimizabilityAdminSummaryResponse = z.infer<
  typeof optimizabilityAdminSummaryResponseSchema
>

export const optimizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: optimizabilityAdminActionSchema,
})
export type OptimizabilityAdminActionRequest = z.infer<
  typeof optimizabilityAdminActionRequestSchema
>

export const optimizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: optimizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: optimizabilityAdminStatsSchema.optional(),
})
export type OptimizabilityAdminActionResponse = z.infer<
  typeof optimizabilityAdminActionResponseSchema
>
