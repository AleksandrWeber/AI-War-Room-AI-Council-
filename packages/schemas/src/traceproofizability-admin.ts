import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const traceproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TraceproofizabilityAdminDomain = z.infer<typeof traceproofizabilityAdminDomainSchema>

export const traceproofizabilityAdminRecordSchema = z.object({
  domain: traceproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TraceproofizabilityAdminRecord = z.infer<typeof traceproofizabilityAdminRecordSchema>

export const traceproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  traceproofizabilityPercent: z.number().min(0).max(100),
})
export type TraceproofizabilityAdminStats = z.infer<typeof traceproofizabilityAdminStatsSchema>

export const traceproofizabilityAdminActionSchema = z.enum(['refresh_traceproofizability_summary'])
export type TraceproofizabilityAdminAction = z.infer<typeof traceproofizabilityAdminActionSchema>

export const traceproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(traceproofizabilityAdminRecordSchema),
  stats: traceproofizabilityAdminStatsSchema,
  availableActions: z.array(traceproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TraceproofizabilityAdminSummaryResponse = z.infer<
  typeof traceproofizabilityAdminSummaryResponseSchema
>

export const traceproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceproofizabilityAdminActionSchema,
})
export type TraceproofizabilityAdminActionRequest = z.infer<
  typeof traceproofizabilityAdminActionRequestSchema
>

export const traceproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: traceproofizabilityAdminStatsSchema.optional(),
})
export type TraceproofizabilityAdminActionResponse = z.infer<
  typeof traceproofizabilityAdminActionResponseSchema
>
