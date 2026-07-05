import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const isolatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type IsolatizabilityAdminDomain = z.infer<typeof isolatizabilityAdminDomainSchema>

export const isolatizabilityAdminRecordSchema = z.object({
  domain: isolatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IsolatizabilityAdminRecord = z.infer<typeof isolatizabilityAdminRecordSchema>

export const isolatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  isolatizabilityPercent: z.number().min(0).max(100),
})
export type IsolatizabilityAdminStats = z.infer<typeof isolatizabilityAdminStatsSchema>

export const isolatizabilityAdminActionSchema = z.enum(['refresh_isolatizability_summary'])
export type IsolatizabilityAdminAction = z.infer<typeof isolatizabilityAdminActionSchema>

export const isolatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(isolatizabilityAdminRecordSchema),
  stats: isolatizabilityAdminStatsSchema,
  availableActions: z.array(isolatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IsolatizabilityAdminSummaryResponse = z.infer<
  typeof isolatizabilityAdminSummaryResponseSchema
>

export const isolatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: isolatizabilityAdminActionSchema,
})
export type IsolatizabilityAdminActionRequest = z.infer<
  typeof isolatizabilityAdminActionRequestSchema
>

export const isolatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: isolatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: isolatizabilityAdminStatsSchema.optional(),
})
export type IsolatizabilityAdminActionResponse = z.infer<
  typeof isolatizabilityAdminActionResponseSchema
>
