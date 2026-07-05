import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const parsabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ParsabilityAdminDomain = z.infer<typeof parsabilityAdminDomainSchema>

export const parsabilityAdminRecordSchema = z.object({
  domain: parsabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ParsabilityAdminRecord = z.infer<typeof parsabilityAdminRecordSchema>

export const parsabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  parsabilityPercent: z.number().min(0).max(100),
})
export type ParsabilityAdminStats = z.infer<typeof parsabilityAdminStatsSchema>

export const parsabilityAdminActionSchema = z.enum(['refresh_parsability_summary'])
export type ParsabilityAdminAction = z.infer<typeof parsabilityAdminActionSchema>

export const parsabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(parsabilityAdminRecordSchema),
  stats: parsabilityAdminStatsSchema,
  availableActions: z.array(parsabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ParsabilityAdminSummaryResponse = z.infer<
  typeof parsabilityAdminSummaryResponseSchema
>

export const parsabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parsabilityAdminActionSchema,
})
export type ParsabilityAdminActionRequest = z.infer<
  typeof parsabilityAdminActionRequestSchema
>

export const parsabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parsabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: parsabilityAdminStatsSchema.optional(),
})
export type ParsabilityAdminActionResponse = z.infer<
  typeof parsabilityAdminActionResponseSchema
>
