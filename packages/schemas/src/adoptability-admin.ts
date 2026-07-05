import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adoptabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'workspace_memberships',
])
export type AdoptabilityAdminDomain = z.infer<typeof adoptabilityAdminDomainSchema>

export const adoptabilityAdminRecordSchema = z.object({
  domain: adoptabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdoptabilityAdminRecord = z.infer<typeof adoptabilityAdminRecordSchema>

export const adoptabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adoptabilityPercent: z.number().min(0).max(100),
})
export type AdoptabilityAdminStats = z.infer<typeof adoptabilityAdminStatsSchema>

export const adoptabilityAdminActionSchema = z.enum(['refresh_adoptability_summary'])
export type AdoptabilityAdminAction = z.infer<typeof adoptabilityAdminActionSchema>

export const adoptabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adoptabilityAdminRecordSchema),
  stats: adoptabilityAdminStatsSchema,
  availableActions: z.array(adoptabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdoptabilityAdminSummaryResponse = z.infer<
  typeof adoptabilityAdminSummaryResponseSchema
>

export const adoptabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adoptabilityAdminActionSchema,
})
export type AdoptabilityAdminActionRequest = z.infer<
  typeof adoptabilityAdminActionRequestSchema
>

export const adoptabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adoptabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adoptabilityAdminStatsSchema.optional(),
})
export type AdoptabilityAdminActionResponse = z.infer<
  typeof adoptabilityAdminActionResponseSchema
>
