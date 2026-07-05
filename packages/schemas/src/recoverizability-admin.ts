import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const recoverizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type RecoverizabilityAdminDomain = z.infer<typeof recoverizabilityAdminDomainSchema>

export const recoverizabilityAdminRecordSchema = z.object({
  domain: recoverizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RecoverizabilityAdminRecord = z.infer<typeof recoverizabilityAdminRecordSchema>

export const recoverizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  recoverizabilityPercent: z.number().min(0).max(100),
})
export type RecoverizabilityAdminStats = z.infer<typeof recoverizabilityAdminStatsSchema>

export const recoverizabilityAdminActionSchema = z.enum(['refresh_recoverizability_summary'])
export type RecoverizabilityAdminAction = z.infer<typeof recoverizabilityAdminActionSchema>

export const recoverizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(recoverizabilityAdminRecordSchema),
  stats: recoverizabilityAdminStatsSchema,
  availableActions: z.array(recoverizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RecoverizabilityAdminSummaryResponse = z.infer<
  typeof recoverizabilityAdminSummaryResponseSchema
>

export const recoverizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoverizabilityAdminActionSchema,
})
export type RecoverizabilityAdminActionRequest = z.infer<
  typeof recoverizabilityAdminActionRequestSchema
>

export const recoverizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoverizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: recoverizabilityAdminStatsSchema.optional(),
})
export type RecoverizabilityAdminActionResponse = z.infer<
  typeof recoverizabilityAdminActionResponseSchema
>
