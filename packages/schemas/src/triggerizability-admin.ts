import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const triggerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TriggerizabilityAdminDomain = z.infer<typeof triggerizabilityAdminDomainSchema>

export const triggerizabilityAdminRecordSchema = z.object({
  domain: triggerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TriggerizabilityAdminRecord = z.infer<typeof triggerizabilityAdminRecordSchema>

export const triggerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  triggerizabilityPercent: z.number().min(0).max(100),
})
export type TriggerizabilityAdminStats = z.infer<typeof triggerizabilityAdminStatsSchema>

export const triggerizabilityAdminActionSchema = z.enum(['refresh_triggerizability_summary'])
export type TriggerizabilityAdminAction = z.infer<typeof triggerizabilityAdminActionSchema>

export const triggerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(triggerizabilityAdminRecordSchema),
  stats: triggerizabilityAdminStatsSchema,
  availableActions: z.array(triggerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TriggerizabilityAdminSummaryResponse = z.infer<
  typeof triggerizabilityAdminSummaryResponseSchema
>

export const triggerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: triggerizabilityAdminActionSchema,
})
export type TriggerizabilityAdminActionRequest = z.infer<
  typeof triggerizabilityAdminActionRequestSchema
>

export const triggerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: triggerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: triggerizabilityAdminStatsSchema.optional(),
})
export type TriggerizabilityAdminActionResponse = z.infer<
  typeof triggerizabilityAdminActionResponseSchema
>
