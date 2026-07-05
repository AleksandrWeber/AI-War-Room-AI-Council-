import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const manageabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'idempotency_keys',
])
export type ManageabilityAdminDomain = z.infer<typeof manageabilityAdminDomainSchema>

export const manageabilityAdminRecordSchema = z.object({
  domain: manageabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ManageabilityAdminRecord = z.infer<typeof manageabilityAdminRecordSchema>

export const manageabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  manageabilityPercent: z.number().min(0).max(100),
})
export type ManageabilityAdminStats = z.infer<typeof manageabilityAdminStatsSchema>

export const manageabilityAdminActionSchema = z.enum(['refresh_manageability_summary'])
export type ManageabilityAdminAction = z.infer<typeof manageabilityAdminActionSchema>

export const manageabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(manageabilityAdminRecordSchema),
  stats: manageabilityAdminStatsSchema,
  availableActions: z.array(manageabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ManageabilityAdminSummaryResponse = z.infer<
  typeof manageabilityAdminSummaryResponseSchema
>

export const manageabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: manageabilityAdminActionSchema,
})
export type ManageabilityAdminActionRequest = z.infer<
  typeof manageabilityAdminActionRequestSchema
>

export const manageabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: manageabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: manageabilityAdminStatsSchema.optional(),
})
export type ManageabilityAdminActionResponse = z.infer<
  typeof manageabilityAdminActionResponseSchema
>
