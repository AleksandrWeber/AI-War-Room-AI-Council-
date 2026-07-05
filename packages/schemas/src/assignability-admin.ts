import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assignabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'billing_notifications',
])
export type AssignabilityAdminDomain = z.infer<typeof assignabilityAdminDomainSchema>

export const assignabilityAdminRecordSchema = z.object({
  domain: assignabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssignabilityAdminRecord = z.infer<typeof assignabilityAdminRecordSchema>

export const assignabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assignabilityPercent: z.number().min(0).max(100),
})
export type AssignabilityAdminStats = z.infer<typeof assignabilityAdminStatsSchema>

export const assignabilityAdminActionSchema = z.enum(['refresh_assignability_summary'])
export type AssignabilityAdminAction = z.infer<typeof assignabilityAdminActionSchema>

export const assignabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assignabilityAdminRecordSchema),
  stats: assignabilityAdminStatsSchema,
  availableActions: z.array(assignabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssignabilityAdminSummaryResponse = z.infer<
  typeof assignabilityAdminSummaryResponseSchema
>

export const assignabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assignabilityAdminActionSchema,
})
export type AssignabilityAdminActionRequest = z.infer<
  typeof assignabilityAdminActionRequestSchema
>

export const assignabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assignabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assignabilityAdminStatsSchema.optional(),
})
export type AssignabilityAdminActionResponse = z.infer<
  typeof assignabilityAdminActionResponseSchema
>
