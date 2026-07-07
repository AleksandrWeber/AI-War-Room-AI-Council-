import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const notarledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type NotarledgerizabilityAdminDomain = z.infer<typeof notarledgerizabilityAdminDomainSchema>

export const notarledgerizabilityAdminRecordSchema = z.object({
  domain: notarledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NotarledgerizabilityAdminRecord = z.infer<typeof notarledgerizabilityAdminRecordSchema>

export const notarledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  notarledgerizabilityPercent: z.number().min(0).max(100),
})
export type NotarledgerizabilityAdminStats = z.infer<typeof notarledgerizabilityAdminStatsSchema>

export const notarledgerizabilityAdminActionSchema = z.enum(['refresh_notarledgerizability_summary'])
export type NotarledgerizabilityAdminAction = z.infer<typeof notarledgerizabilityAdminActionSchema>

export const notarledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(notarledgerizabilityAdminRecordSchema),
  stats: notarledgerizabilityAdminStatsSchema,
  availableActions: z.array(notarledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NotarledgerizabilityAdminSummaryResponse = z.infer<
  typeof notarledgerizabilityAdminSummaryResponseSchema
>

export const notarledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarledgerizabilityAdminActionSchema,
})
export type NotarledgerizabilityAdminActionRequest = z.infer<
  typeof notarledgerizabilityAdminActionRequestSchema
>

export const notarledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: notarledgerizabilityAdminStatsSchema.optional(),
})
export type NotarledgerizabilityAdminActionResponse = z.infer<
  typeof notarledgerizabilityAdminActionResponseSchema
>
