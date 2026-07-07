import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attesttrackizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AttesttrackizabilityAdminDomain = z.infer<typeof attesttrackizabilityAdminDomainSchema>

export const attesttrackizabilityAdminRecordSchema = z.object({
  domain: attesttrackizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttesttrackizabilityAdminRecord = z.infer<typeof attesttrackizabilityAdminRecordSchema>

export const attesttrackizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attesttrackizabilityPercent: z.number().min(0).max(100),
})
export type AttesttrackizabilityAdminStats = z.infer<typeof attesttrackizabilityAdminStatsSchema>

export const attesttrackizabilityAdminActionSchema = z.enum(['refresh_attesttrackizability_summary'])
export type AttesttrackizabilityAdminAction = z.infer<typeof attesttrackizabilityAdminActionSchema>

export const attesttrackizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attesttrackizabilityAdminRecordSchema),
  stats: attesttrackizabilityAdminStatsSchema,
  availableActions: z.array(attesttrackizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttesttrackizabilityAdminSummaryResponse = z.infer<
  typeof attesttrackizabilityAdminSummaryResponseSchema
>

export const attesttrackizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attesttrackizabilityAdminActionSchema,
})
export type AttesttrackizabilityAdminActionRequest = z.infer<
  typeof attesttrackizabilityAdminActionRequestSchema
>

export const attesttrackizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attesttrackizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attesttrackizabilityAdminStatsSchema.optional(),
})
export type AttesttrackizabilityAdminActionResponse = z.infer<
  typeof attesttrackizabilityAdminActionResponseSchema
>
