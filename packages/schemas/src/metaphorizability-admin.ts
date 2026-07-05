import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const metaphorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'billing_webhook_events',
])
export type MetaphorizabilityAdminDomain = z.infer<typeof metaphorizabilityAdminDomainSchema>

export const metaphorizabilityAdminRecordSchema = z.object({
  domain: metaphorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MetaphorizabilityAdminRecord = z.infer<typeof metaphorizabilityAdminRecordSchema>

export const metaphorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  metaphorizabilityPercent: z.number().min(0).max(100),
})
export type MetaphorizabilityAdminStats = z.infer<typeof metaphorizabilityAdminStatsSchema>

export const metaphorizabilityAdminActionSchema = z.enum(['refresh_metaphorizability_summary'])
export type MetaphorizabilityAdminAction = z.infer<typeof metaphorizabilityAdminActionSchema>

export const metaphorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(metaphorizabilityAdminRecordSchema),
  stats: metaphorizabilityAdminStatsSchema,
  availableActions: z.array(metaphorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MetaphorizabilityAdminSummaryResponse = z.infer<
  typeof metaphorizabilityAdminSummaryResponseSchema
>

export const metaphorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: metaphorizabilityAdminActionSchema,
})
export type MetaphorizabilityAdminActionRequest = z.infer<
  typeof metaphorizabilityAdminActionRequestSchema
>

export const metaphorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: metaphorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: metaphorizabilityAdminStatsSchema.optional(),
})
export type MetaphorizabilityAdminActionResponse = z.infer<
  typeof metaphorizabilityAdminActionResponseSchema
>
