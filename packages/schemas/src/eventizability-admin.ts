import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const eventizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type EventizabilityAdminDomain = z.infer<typeof eventizabilityAdminDomainSchema>

export const eventizabilityAdminRecordSchema = z.object({
  domain: eventizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EventizabilityAdminRecord = z.infer<typeof eventizabilityAdminRecordSchema>

export const eventizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  eventizabilityPercent: z.number().min(0).max(100),
})
export type EventizabilityAdminStats = z.infer<typeof eventizabilityAdminStatsSchema>

export const eventizabilityAdminActionSchema = z.enum(['refresh_eventizability_summary'])
export type EventizabilityAdminAction = z.infer<typeof eventizabilityAdminActionSchema>

export const eventizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(eventizabilityAdminRecordSchema),
  stats: eventizabilityAdminStatsSchema,
  availableActions: z.array(eventizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EventizabilityAdminSummaryResponse = z.infer<
  typeof eventizabilityAdminSummaryResponseSchema
>

export const eventizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: eventizabilityAdminActionSchema,
})
export type EventizabilityAdminActionRequest = z.infer<
  typeof eventizabilityAdminActionRequestSchema
>

export const eventizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: eventizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: eventizabilityAdminStatsSchema.optional(),
})
export type EventizabilityAdminActionResponse = z.infer<
  typeof eventizabilityAdminActionResponseSchema
>
