import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dependableizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type DependableizabilityAdminDomain = z.infer<typeof dependableizabilityAdminDomainSchema>

export const dependableizabilityAdminRecordSchema = z.object({
  domain: dependableizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DependableizabilityAdminRecord = z.infer<typeof dependableizabilityAdminRecordSchema>

export const dependableizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dependableizabilityPercent: z.number().min(0).max(100),
})
export type DependableizabilityAdminStats = z.infer<typeof dependableizabilityAdminStatsSchema>

export const dependableizabilityAdminActionSchema = z.enum(['refresh_dependableizability_summary'])
export type DependableizabilityAdminAction = z.infer<typeof dependableizabilityAdminActionSchema>

export const dependableizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dependableizabilityAdminRecordSchema),
  stats: dependableizabilityAdminStatsSchema,
  availableActions: z.array(dependableizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DependableizabilityAdminSummaryResponse = z.infer<
  typeof dependableizabilityAdminSummaryResponseSchema
>

export const dependableizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependableizabilityAdminActionSchema,
})
export type DependableizabilityAdminActionRequest = z.infer<
  typeof dependableizabilityAdminActionRequestSchema
>

export const dependableizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependableizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dependableizabilityAdminStatsSchema.optional(),
})
export type DependableizabilityAdminActionResponse = z.infer<
  typeof dependableizabilityAdminActionResponseSchema
>
