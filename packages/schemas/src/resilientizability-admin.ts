import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const resilientizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type ResilientizabilityAdminDomain = z.infer<typeof resilientizabilityAdminDomainSchema>

export const resilientizabilityAdminRecordSchema = z.object({
  domain: resilientizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ResilientizabilityAdminRecord = z.infer<typeof resilientizabilityAdminRecordSchema>

export const resilientizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  resilientizabilityPercent: z.number().min(0).max(100),
})
export type ResilientizabilityAdminStats = z.infer<typeof resilientizabilityAdminStatsSchema>

export const resilientizabilityAdminActionSchema = z.enum(['refresh_resilientizability_summary'])
export type ResilientizabilityAdminAction = z.infer<typeof resilientizabilityAdminActionSchema>

export const resilientizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(resilientizabilityAdminRecordSchema),
  stats: resilientizabilityAdminStatsSchema,
  availableActions: z.array(resilientizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ResilientizabilityAdminSummaryResponse = z.infer<
  typeof resilientizabilityAdminSummaryResponseSchema
>

export const resilientizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: resilientizabilityAdminActionSchema,
})
export type ResilientizabilityAdminActionRequest = z.infer<
  typeof resilientizabilityAdminActionRequestSchema
>

export const resilientizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: resilientizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: resilientizabilityAdminStatsSchema.optional(),
})
export type ResilientizabilityAdminActionResponse = z.infer<
  typeof resilientizabilityAdminActionResponseSchema
>
