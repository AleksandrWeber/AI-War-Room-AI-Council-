import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dramatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'agent_outputs',
])
export type DramatizabilityAdminDomain = z.infer<typeof dramatizabilityAdminDomainSchema>

export const dramatizabilityAdminRecordSchema = z.object({
  domain: dramatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DramatizabilityAdminRecord = z.infer<typeof dramatizabilityAdminRecordSchema>

export const dramatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dramatizabilityPercent: z.number().min(0).max(100),
})
export type DramatizabilityAdminStats = z.infer<typeof dramatizabilityAdminStatsSchema>

export const dramatizabilityAdminActionSchema = z.enum(['refresh_dramatizability_summary'])
export type DramatizabilityAdminAction = z.infer<typeof dramatizabilityAdminActionSchema>

export const dramatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dramatizabilityAdminRecordSchema),
  stats: dramatizabilityAdminStatsSchema,
  availableActions: z.array(dramatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DramatizabilityAdminSummaryResponse = z.infer<
  typeof dramatizabilityAdminSummaryResponseSchema
>

export const dramatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dramatizabilityAdminActionSchema,
})
export type DramatizabilityAdminActionRequest = z.infer<
  typeof dramatizabilityAdminActionRequestSchema
>

export const dramatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dramatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dramatizabilityAdminStatsSchema.optional(),
})
export type DramatizabilityAdminActionResponse = z.infer<
  typeof dramatizabilityAdminActionResponseSchema
>
