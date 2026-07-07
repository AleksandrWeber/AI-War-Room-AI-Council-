import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const traceledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TraceledgerizabilityAdminDomain = z.infer<typeof traceledgerizabilityAdminDomainSchema>

export const traceledgerizabilityAdminRecordSchema = z.object({
  domain: traceledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TraceledgerizabilityAdminRecord = z.infer<typeof traceledgerizabilityAdminRecordSchema>

export const traceledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  traceledgerizabilityPercent: z.number().min(0).max(100),
})
export type TraceledgerizabilityAdminStats = z.infer<typeof traceledgerizabilityAdminStatsSchema>

export const traceledgerizabilityAdminActionSchema = z.enum(['refresh_traceledgerizability_summary'])
export type TraceledgerizabilityAdminAction = z.infer<typeof traceledgerizabilityAdminActionSchema>

export const traceledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(traceledgerizabilityAdminRecordSchema),
  stats: traceledgerizabilityAdminStatsSchema,
  availableActions: z.array(traceledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TraceledgerizabilityAdminSummaryResponse = z.infer<
  typeof traceledgerizabilityAdminSummaryResponseSchema
>

export const traceledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceledgerizabilityAdminActionSchema,
})
export type TraceledgerizabilityAdminActionRequest = z.infer<
  typeof traceledgerizabilityAdminActionRequestSchema
>

export const traceledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: traceledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: traceledgerizabilityAdminStatsSchema.optional(),
})
export type TraceledgerizabilityAdminActionResponse = z.infer<
  typeof traceledgerizabilityAdminActionResponseSchema
>
