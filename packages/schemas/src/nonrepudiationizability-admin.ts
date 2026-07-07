import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const nonrepudiationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type NonrepudiationizabilityAdminDomain = z.infer<typeof nonrepudiationizabilityAdminDomainSchema>

export const nonrepudiationizabilityAdminRecordSchema = z.object({
  domain: nonrepudiationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NonrepudiationizabilityAdminRecord = z.infer<typeof nonrepudiationizabilityAdminRecordSchema>

export const nonrepudiationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  nonrepudiationizabilityPercent: z.number().min(0).max(100),
})
export type NonrepudiationizabilityAdminStats = z.infer<typeof nonrepudiationizabilityAdminStatsSchema>

export const nonrepudiationizabilityAdminActionSchema = z.enum(['refresh_nonrepudiationizability_summary'])
export type NonrepudiationizabilityAdminAction = z.infer<typeof nonrepudiationizabilityAdminActionSchema>

export const nonrepudiationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(nonrepudiationizabilityAdminRecordSchema),
  stats: nonrepudiationizabilityAdminStatsSchema,
  availableActions: z.array(nonrepudiationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NonrepudiationizabilityAdminSummaryResponse = z.infer<
  typeof nonrepudiationizabilityAdminSummaryResponseSchema
>

export const nonrepudiationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nonrepudiationizabilityAdminActionSchema,
})
export type NonrepudiationizabilityAdminActionRequest = z.infer<
  typeof nonrepudiationizabilityAdminActionRequestSchema
>

export const nonrepudiationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nonrepudiationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: nonrepudiationizabilityAdminStatsSchema.optional(),
})
export type NonrepudiationizabilityAdminActionResponse = z.infer<
  typeof nonrepudiationizabilityAdminActionResponseSchema
>
