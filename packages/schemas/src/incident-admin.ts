import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const incidentAdminDomainSchema = z.enum([
  'failed_runs',
  'blocked_runs',
  'billing_alerts',
  'shield_incidents',
])
export type IncidentAdminDomain = z.infer<typeof incidentAdminDomainSchema>

export const incidentAdminRecordSchema = z.object({
  domain: incidentAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IncidentAdminRecord = z.infer<typeof incidentAdminRecordSchema>

export const incidentAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  observabilityErrorEvents: z.number().int().nonnegative(),
})
export type IncidentAdminStats = z.infer<typeof incidentAdminStatsSchema>

export const incidentAdminActionSchema = z.enum(['refresh_incident_summary'])
export type IncidentAdminAction = z.infer<typeof incidentAdminActionSchema>

export const incidentAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(incidentAdminRecordSchema),
  stats: incidentAdminStatsSchema,
  availableActions: z.array(incidentAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IncidentAdminSummaryResponse = z.infer<
  typeof incidentAdminSummaryResponseSchema
>

export const incidentAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: incidentAdminActionSchema,
})
export type IncidentAdminActionRequest = z.infer<
  typeof incidentAdminActionRequestSchema
>

export const incidentAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: incidentAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: incidentAdminStatsSchema.optional(),
})
export type IncidentAdminActionResponse = z.infer<
  typeof incidentAdminActionResponseSchema
>
