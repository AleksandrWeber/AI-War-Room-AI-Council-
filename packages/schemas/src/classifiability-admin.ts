import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const classifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ClassifiabilityAdminDomain = z.infer<typeof classifiabilityAdminDomainSchema>

export const classifiabilityAdminRecordSchema = z.object({
  domain: classifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ClassifiabilityAdminRecord = z.infer<typeof classifiabilityAdminRecordSchema>

export const classifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  classifiabilityPercent: z.number().min(0).max(100),
})
export type ClassifiabilityAdminStats = z.infer<typeof classifiabilityAdminStatsSchema>

export const classifiabilityAdminActionSchema = z.enum(['refresh_classifiability_summary'])
export type ClassifiabilityAdminAction = z.infer<typeof classifiabilityAdminActionSchema>

export const classifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(classifiabilityAdminRecordSchema),
  stats: classifiabilityAdminStatsSchema,
  availableActions: z.array(classifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ClassifiabilityAdminSummaryResponse = z.infer<
  typeof classifiabilityAdminSummaryResponseSchema
>

export const classifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: classifiabilityAdminActionSchema,
})
export type ClassifiabilityAdminActionRequest = z.infer<
  typeof classifiabilityAdminActionRequestSchema
>

export const classifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: classifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: classifiabilityAdminStatsSchema.optional(),
})
export type ClassifiabilityAdminActionResponse = z.infer<
  typeof classifiabilityAdminActionResponseSchema
>
