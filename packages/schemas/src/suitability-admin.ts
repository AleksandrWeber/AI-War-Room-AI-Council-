import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const suitabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type SuitabilityAdminDomain = z.infer<typeof suitabilityAdminDomainSchema>

export const suitabilityAdminRecordSchema = z.object({
  domain: suitabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SuitabilityAdminRecord = z.infer<typeof suitabilityAdminRecordSchema>

export const suitabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  suitabilityPercent: z.number().min(0).max(100),
})
export type SuitabilityAdminStats = z.infer<typeof suitabilityAdminStatsSchema>

export const suitabilityAdminActionSchema = z.enum(['refresh_suitability_summary'])
export type SuitabilityAdminAction = z.infer<typeof suitabilityAdminActionSchema>

export const suitabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(suitabilityAdminRecordSchema),
  stats: suitabilityAdminStatsSchema,
  availableActions: z.array(suitabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SuitabilityAdminSummaryResponse = z.infer<
  typeof suitabilityAdminSummaryResponseSchema
>

export const suitabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: suitabilityAdminActionSchema,
})
export type SuitabilityAdminActionRequest = z.infer<
  typeof suitabilityAdminActionRequestSchema
>

export const suitabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: suitabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: suitabilityAdminStatsSchema.optional(),
})
export type SuitabilityAdminActionResponse = z.infer<
  typeof suitabilityAdminActionResponseSchema
>
