import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const stabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'applied_migrations',
])
export type StabilityAdminDomain = z.infer<typeof stabilityAdminDomainSchema>

export const stabilityAdminRecordSchema = z.object({
  domain: stabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StabilityAdminRecord = z.infer<typeof stabilityAdminRecordSchema>

export const stabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  stabilityPercent: z.number().min(0).max(100),
})
export type StabilityAdminStats = z.infer<typeof stabilityAdminStatsSchema>

export const stabilityAdminActionSchema = z.enum(['refresh_stability_summary'])
export type StabilityAdminAction = z.infer<typeof stabilityAdminActionSchema>

export const stabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(stabilityAdminRecordSchema),
  stats: stabilityAdminStatsSchema,
  availableActions: z.array(stabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StabilityAdminSummaryResponse = z.infer<
  typeof stabilityAdminSummaryResponseSchema
>

export const stabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stabilityAdminActionSchema,
})
export type StabilityAdminActionRequest = z.infer<
  typeof stabilityAdminActionRequestSchema
>

export const stabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: stabilityAdminStatsSchema.optional(),
})
export type StabilityAdminActionResponse = z.infer<
  typeof stabilityAdminActionResponseSchema
>
