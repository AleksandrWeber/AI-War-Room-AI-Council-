import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const categorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type CategorizabilityAdminDomain = z.infer<typeof categorizabilityAdminDomainSchema>

export const categorizabilityAdminRecordSchema = z.object({
  domain: categorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CategorizabilityAdminRecord = z.infer<typeof categorizabilityAdminRecordSchema>

export const categorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  categorizabilityPercent: z.number().min(0).max(100),
})
export type CategorizabilityAdminStats = z.infer<typeof categorizabilityAdminStatsSchema>

export const categorizabilityAdminActionSchema = z.enum(['refresh_categorizability_summary'])
export type CategorizabilityAdminAction = z.infer<typeof categorizabilityAdminActionSchema>

export const categorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(categorizabilityAdminRecordSchema),
  stats: categorizabilityAdminStatsSchema,
  availableActions: z.array(categorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CategorizabilityAdminSummaryResponse = z.infer<
  typeof categorizabilityAdminSummaryResponseSchema
>

export const categorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: categorizabilityAdminActionSchema,
})
export type CategorizabilityAdminActionRequest = z.infer<
  typeof categorizabilityAdminActionRequestSchema
>

export const categorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: categorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: categorizabilityAdminStatsSchema.optional(),
})
export type CategorizabilityAdminActionResponse = z.infer<
  typeof categorizabilityAdminActionResponseSchema
>
