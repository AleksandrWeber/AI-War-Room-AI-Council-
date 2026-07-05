import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const featureflagizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type FeatureflagizabilityAdminDomain = z.infer<typeof featureflagizabilityAdminDomainSchema>

export const featureflagizabilityAdminRecordSchema = z.object({
  domain: featureflagizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FeatureflagizabilityAdminRecord = z.infer<typeof featureflagizabilityAdminRecordSchema>

export const featureflagizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  featureflagizabilityPercent: z.number().min(0).max(100),
})
export type FeatureflagizabilityAdminStats = z.infer<typeof featureflagizabilityAdminStatsSchema>

export const featureflagizabilityAdminActionSchema = z.enum(['refresh_featureflagizability_summary'])
export type FeatureflagizabilityAdminAction = z.infer<typeof featureflagizabilityAdminActionSchema>

export const featureflagizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(featureflagizabilityAdminRecordSchema),
  stats: featureflagizabilityAdminStatsSchema,
  availableActions: z.array(featureflagizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FeatureflagizabilityAdminSummaryResponse = z.infer<
  typeof featureflagizabilityAdminSummaryResponseSchema
>

export const featureflagizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: featureflagizabilityAdminActionSchema,
})
export type FeatureflagizabilityAdminActionRequest = z.infer<
  typeof featureflagizabilityAdminActionRequestSchema
>

export const featureflagizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: featureflagizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: featureflagizabilityAdminStatsSchema.optional(),
})
export type FeatureflagizabilityAdminActionResponse = z.infer<
  typeof featureflagizabilityAdminActionResponseSchema
>
