import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const notarjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type NotarjournalizabilityAdminDomain = z.infer<typeof notarjournalizabilityAdminDomainSchema>

export const notarjournalizabilityAdminRecordSchema = z.object({
  domain: notarjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NotarjournalizabilityAdminRecord = z.infer<typeof notarjournalizabilityAdminRecordSchema>

export const notarjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  notarjournalizabilityPercent: z.number().min(0).max(100),
})
export type NotarjournalizabilityAdminStats = z.infer<typeof notarjournalizabilityAdminStatsSchema>

export const notarjournalizabilityAdminActionSchema = z.enum(['refresh_notarjournalizability_summary'])
export type NotarjournalizabilityAdminAction = z.infer<typeof notarjournalizabilityAdminActionSchema>

export const notarjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(notarjournalizabilityAdminRecordSchema),
  stats: notarjournalizabilityAdminStatsSchema,
  availableActions: z.array(notarjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NotarjournalizabilityAdminSummaryResponse = z.infer<
  typeof notarjournalizabilityAdminSummaryResponseSchema
>

export const notarjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarjournalizabilityAdminActionSchema,
})
export type NotarjournalizabilityAdminActionRequest = z.infer<
  typeof notarjournalizabilityAdminActionRequestSchema
>

export const notarjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: notarjournalizabilityAdminStatsSchema.optional(),
})
export type NotarjournalizabilityAdminActionResponse = z.infer<
  typeof notarjournalizabilityAdminActionResponseSchema
>
