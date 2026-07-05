import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const typologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TypologizabilityAdminDomain = z.infer<typeof typologizabilityAdminDomainSchema>

export const typologizabilityAdminRecordSchema = z.object({
  domain: typologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TypologizabilityAdminRecord = z.infer<typeof typologizabilityAdminRecordSchema>

export const typologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  typologizabilityPercent: z.number().min(0).max(100),
})
export type TypologizabilityAdminStats = z.infer<typeof typologizabilityAdminStatsSchema>

export const typologizabilityAdminActionSchema = z.enum(['refresh_typologizability_summary'])
export type TypologizabilityAdminAction = z.infer<typeof typologizabilityAdminActionSchema>

export const typologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(typologizabilityAdminRecordSchema),
  stats: typologizabilityAdminStatsSchema,
  availableActions: z.array(typologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TypologizabilityAdminSummaryResponse = z.infer<
  typeof typologizabilityAdminSummaryResponseSchema
>

export const typologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: typologizabilityAdminActionSchema,
})
export type TypologizabilityAdminActionRequest = z.infer<
  typeof typologizabilityAdminActionRequestSchema
>

export const typologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: typologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: typologizabilityAdminStatsSchema.optional(),
})
export type TypologizabilityAdminActionResponse = z.infer<
  typeof typologizabilityAdminActionResponseSchema
>
