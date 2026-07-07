import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const schedulabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type SchedulabilityvaultizabilityAdminDomain = z.infer<typeof schedulabilityvaultizabilityAdminDomainSchema>

export const schedulabilityvaultizabilityAdminRecordSchema = z.object({
  domain: schedulabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SchedulabilityvaultizabilityAdminRecord = z.infer<typeof schedulabilityvaultizabilityAdminRecordSchema>

export const schedulabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  schedulabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type SchedulabilityvaultizabilityAdminStats = z.infer<typeof schedulabilityvaultizabilityAdminStatsSchema>

export const schedulabilityvaultizabilityAdminActionSchema = z.enum(['refresh_schedulabilityvaultizability_summary'])
export type SchedulabilityvaultizabilityAdminAction = z.infer<typeof schedulabilityvaultizabilityAdminActionSchema>

export const schedulabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(schedulabilityvaultizabilityAdminRecordSchema),
  stats: schedulabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(schedulabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SchedulabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof schedulabilityvaultizabilityAdminSummaryResponseSchema
>

export const schedulabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulabilityvaultizabilityAdminActionSchema,
})
export type SchedulabilityvaultizabilityAdminActionRequest = z.infer<
  typeof schedulabilityvaultizabilityAdminActionRequestSchema
>

export const schedulabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: schedulabilityvaultizabilityAdminStatsSchema.optional(),
})
export type SchedulabilityvaultizabilityAdminActionResponse = z.infer<
  typeof schedulabilityvaultizabilityAdminActionResponseSchema
>
