import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const projectizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ProjectizabilityAdminDomain = z.infer<typeof projectizabilityAdminDomainSchema>

export const projectizabilityAdminRecordSchema = z.object({
  domain: projectizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProjectizabilityAdminRecord = z.infer<typeof projectizabilityAdminRecordSchema>

export const projectizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  projectizabilityPercent: z.number().min(0).max(100),
})
export type ProjectizabilityAdminStats = z.infer<typeof projectizabilityAdminStatsSchema>

export const projectizabilityAdminActionSchema = z.enum(['refresh_projectizability_summary'])
export type ProjectizabilityAdminAction = z.infer<typeof projectizabilityAdminActionSchema>

export const projectizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(projectizabilityAdminRecordSchema),
  stats: projectizabilityAdminStatsSchema,
  availableActions: z.array(projectizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProjectizabilityAdminSummaryResponse = z.infer<
  typeof projectizabilityAdminSummaryResponseSchema
>

export const projectizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: projectizabilityAdminActionSchema,
})
export type ProjectizabilityAdminActionRequest = z.infer<
  typeof projectizabilityAdminActionRequestSchema
>

export const projectizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: projectizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: projectizabilityAdminStatsSchema.optional(),
})
export type ProjectizabilityAdminActionResponse = z.infer<
  typeof projectizabilityAdminActionResponseSchema
>
