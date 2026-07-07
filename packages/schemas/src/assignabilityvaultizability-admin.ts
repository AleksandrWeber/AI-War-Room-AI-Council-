import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assignabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AssignabilityvaultizabilityAdminDomain = z.infer<typeof assignabilityvaultizabilityAdminDomainSchema>

export const assignabilityvaultizabilityAdminRecordSchema = z.object({
  domain: assignabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssignabilityvaultizabilityAdminRecord = z.infer<typeof assignabilityvaultizabilityAdminRecordSchema>

export const assignabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assignabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AssignabilityvaultizabilityAdminStats = z.infer<typeof assignabilityvaultizabilityAdminStatsSchema>

export const assignabilityvaultizabilityAdminActionSchema = z.enum(['refresh_assignabilityvaultizability_summary'])
export type AssignabilityvaultizabilityAdminAction = z.infer<typeof assignabilityvaultizabilityAdminActionSchema>

export const assignabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assignabilityvaultizabilityAdminRecordSchema),
  stats: assignabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(assignabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssignabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof assignabilityvaultizabilityAdminSummaryResponseSchema
>

export const assignabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assignabilityvaultizabilityAdminActionSchema,
})
export type AssignabilityvaultizabilityAdminActionRequest = z.infer<
  typeof assignabilityvaultizabilityAdminActionRequestSchema
>

export const assignabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assignabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assignabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AssignabilityvaultizabilityAdminActionResponse = z.infer<
  typeof assignabilityvaultizabilityAdminActionResponseSchema
>
