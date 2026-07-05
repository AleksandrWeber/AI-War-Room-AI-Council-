import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const hermeticizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type HermeticizabilityAdminDomain = z.infer<typeof hermeticizabilityAdminDomainSchema>

export const hermeticizabilityAdminRecordSchema = z.object({
  domain: hermeticizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HermeticizabilityAdminRecord = z.infer<typeof hermeticizabilityAdminRecordSchema>

export const hermeticizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  hermeticizabilityPercent: z.number().min(0).max(100),
})
export type HermeticizabilityAdminStats = z.infer<typeof hermeticizabilityAdminStatsSchema>

export const hermeticizabilityAdminActionSchema = z.enum(['refresh_hermeticizability_summary'])
export type HermeticizabilityAdminAction = z.infer<typeof hermeticizabilityAdminActionSchema>

export const hermeticizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(hermeticizabilityAdminRecordSchema),
  stats: hermeticizabilityAdminStatsSchema,
  availableActions: z.array(hermeticizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HermeticizabilityAdminSummaryResponse = z.infer<
  typeof hermeticizabilityAdminSummaryResponseSchema
>

export const hermeticizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hermeticizabilityAdminActionSchema,
})
export type HermeticizabilityAdminActionRequest = z.infer<
  typeof hermeticizabilityAdminActionRequestSchema
>

export const hermeticizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hermeticizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: hermeticizabilityAdminStatsSchema.optional(),
})
export type HermeticizabilityAdminActionResponse = z.infer<
  typeof hermeticizabilityAdminActionResponseSchema
>
