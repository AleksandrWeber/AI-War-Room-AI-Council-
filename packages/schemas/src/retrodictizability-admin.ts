import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const retrodictizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type RetrodictizabilityAdminDomain = z.infer<typeof retrodictizabilityAdminDomainSchema>

export const retrodictizabilityAdminRecordSchema = z.object({
  domain: retrodictizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RetrodictizabilityAdminRecord = z.infer<typeof retrodictizabilityAdminRecordSchema>

export const retrodictizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  retrodictizabilityPercent: z.number().min(0).max(100),
})
export type RetrodictizabilityAdminStats = z.infer<typeof retrodictizabilityAdminStatsSchema>

export const retrodictizabilityAdminActionSchema = z.enum(['refresh_retrodictizability_summary'])
export type RetrodictizabilityAdminAction = z.infer<typeof retrodictizabilityAdminActionSchema>

export const retrodictizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(retrodictizabilityAdminRecordSchema),
  stats: retrodictizabilityAdminStatsSchema,
  availableActions: z.array(retrodictizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RetrodictizabilityAdminSummaryResponse = z.infer<
  typeof retrodictizabilityAdminSummaryResponseSchema
>

export const retrodictizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrodictizabilityAdminActionSchema,
})
export type RetrodictizabilityAdminActionRequest = z.infer<
  typeof retrodictizabilityAdminActionRequestSchema
>

export const retrodictizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrodictizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: retrodictizabilityAdminStatsSchema.optional(),
})
export type RetrodictizabilityAdminActionResponse = z.infer<
  typeof retrodictizabilityAdminActionResponseSchema
>
