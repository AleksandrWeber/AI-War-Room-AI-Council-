import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const desirabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_notifications',
])
export type DesirabilityAdminDomain = z.infer<typeof desirabilityAdminDomainSchema>

export const desirabilityAdminRecordSchema = z.object({
  domain: desirabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DesirabilityAdminRecord = z.infer<typeof desirabilityAdminRecordSchema>

export const desirabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  desirabilityPercent: z.number().min(0).max(100),
})
export type DesirabilityAdminStats = z.infer<typeof desirabilityAdminStatsSchema>

export const desirabilityAdminActionSchema = z.enum(['refresh_desirability_summary'])
export type DesirabilityAdminAction = z.infer<typeof desirabilityAdminActionSchema>

export const desirabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(desirabilityAdminRecordSchema),
  stats: desirabilityAdminStatsSchema,
  availableActions: z.array(desirabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DesirabilityAdminSummaryResponse = z.infer<
  typeof desirabilityAdminSummaryResponseSchema
>

export const desirabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: desirabilityAdminActionSchema,
})
export type DesirabilityAdminActionRequest = z.infer<
  typeof desirabilityAdminActionRequestSchema
>

export const desirabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: desirabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: desirabilityAdminStatsSchema.optional(),
})
export type DesirabilityAdminActionResponse = z.infer<
  typeof desirabilityAdminActionResponseSchema
>
