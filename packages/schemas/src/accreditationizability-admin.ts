import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const accreditationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AccreditationizabilityAdminDomain = z.infer<typeof accreditationizabilityAdminDomainSchema>

export const accreditationizabilityAdminRecordSchema = z.object({
  domain: accreditationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AccreditationizabilityAdminRecord = z.infer<typeof accreditationizabilityAdminRecordSchema>

export const accreditationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  accreditationizabilityPercent: z.number().min(0).max(100),
})
export type AccreditationizabilityAdminStats = z.infer<typeof accreditationizabilityAdminStatsSchema>

export const accreditationizabilityAdminActionSchema = z.enum(['refresh_accreditationizability_summary'])
export type AccreditationizabilityAdminAction = z.infer<typeof accreditationizabilityAdminActionSchema>

export const accreditationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(accreditationizabilityAdminRecordSchema),
  stats: accreditationizabilityAdminStatsSchema,
  availableActions: z.array(accreditationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AccreditationizabilityAdminSummaryResponse = z.infer<
  typeof accreditationizabilityAdminSummaryResponseSchema
>

export const accreditationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accreditationizabilityAdminActionSchema,
})
export type AccreditationizabilityAdminActionRequest = z.infer<
  typeof accreditationizabilityAdminActionRequestSchema
>

export const accreditationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accreditationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: accreditationizabilityAdminStatsSchema.optional(),
})
export type AccreditationizabilityAdminActionResponse = z.infer<
  typeof accreditationizabilityAdminActionResponseSchema
>
