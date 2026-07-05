import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const transformizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type TransformizabilityAdminDomain = z.infer<typeof transformizabilityAdminDomainSchema>

export const transformizabilityAdminRecordSchema = z.object({
  domain: transformizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TransformizabilityAdminRecord = z.infer<typeof transformizabilityAdminRecordSchema>

export const transformizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  transformizabilityPercent: z.number().min(0).max(100),
})
export type TransformizabilityAdminStats = z.infer<typeof transformizabilityAdminStatsSchema>

export const transformizabilityAdminActionSchema = z.enum(['refresh_transformizability_summary'])
export type TransformizabilityAdminAction = z.infer<typeof transformizabilityAdminActionSchema>

export const transformizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(transformizabilityAdminRecordSchema),
  stats: transformizabilityAdminStatsSchema,
  availableActions: z.array(transformizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TransformizabilityAdminSummaryResponse = z.infer<
  typeof transformizabilityAdminSummaryResponseSchema
>

export const transformizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transformizabilityAdminActionSchema,
})
export type TransformizabilityAdminActionRequest = z.infer<
  typeof transformizabilityAdminActionRequestSchema
>

export const transformizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transformizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: transformizabilityAdminStatsSchema.optional(),
})
export type TransformizabilityAdminActionResponse = z.infer<
  typeof transformizabilityAdminActionResponseSchema
>
