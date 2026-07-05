import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compilatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type CompilatizabilityAdminDomain = z.infer<typeof compilatizabilityAdminDomainSchema>

export const compilatizabilityAdminRecordSchema = z.object({
  domain: compilatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompilatizabilityAdminRecord = z.infer<typeof compilatizabilityAdminRecordSchema>

export const compilatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compilatizabilityPercent: z.number().min(0).max(100),
})
export type CompilatizabilityAdminStats = z.infer<typeof compilatizabilityAdminStatsSchema>

export const compilatizabilityAdminActionSchema = z.enum(['refresh_compilatizability_summary'])
export type CompilatizabilityAdminAction = z.infer<typeof compilatizabilityAdminActionSchema>

export const compilatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compilatizabilityAdminRecordSchema),
  stats: compilatizabilityAdminStatsSchema,
  availableActions: z.array(compilatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompilatizabilityAdminSummaryResponse = z.infer<
  typeof compilatizabilityAdminSummaryResponseSchema
>

export const compilatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compilatizabilityAdminActionSchema,
})
export type CompilatizabilityAdminActionRequest = z.infer<
  typeof compilatizabilityAdminActionRequestSchema
>

export const compilatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compilatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compilatizabilityAdminStatsSchema.optional(),
})
export type CompilatizabilityAdminActionResponse = z.infer<
  typeof compilatizabilityAdminActionResponseSchema
>
