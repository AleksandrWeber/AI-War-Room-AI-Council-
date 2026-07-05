import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const conformanceAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'billing_webhook_events',
])
export type ConformanceAdminDomain = z.infer<typeof conformanceAdminDomainSchema>

export const conformanceAdminRecordSchema = z.object({
  domain: conformanceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConformanceAdminRecord = z.infer<typeof conformanceAdminRecordSchema>

export const conformanceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  conformancePercent: z.number().min(0).max(100),
})
export type ConformanceAdminStats = z.infer<typeof conformanceAdminStatsSchema>

export const conformanceAdminActionSchema = z.enum(['refresh_conformance_summary'])
export type ConformanceAdminAction = z.infer<typeof conformanceAdminActionSchema>

export const conformanceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(conformanceAdminRecordSchema),
  stats: conformanceAdminStatsSchema,
  availableActions: z.array(conformanceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConformanceAdminSummaryResponse = z.infer<
  typeof conformanceAdminSummaryResponseSchema
>

export const conformanceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: conformanceAdminActionSchema,
})
export type ConformanceAdminActionRequest = z.infer<
  typeof conformanceAdminActionRequestSchema
>

export const conformanceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: conformanceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: conformanceAdminStatsSchema.optional(),
})
export type ConformanceAdminActionResponse = z.infer<
  typeof conformanceAdminActionResponseSchema
>
