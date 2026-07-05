import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attributabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type AttributabilityAdminDomain = z.infer<typeof attributabilityAdminDomainSchema>

export const attributabilityAdminRecordSchema = z.object({
  domain: attributabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttributabilityAdminRecord = z.infer<typeof attributabilityAdminRecordSchema>

export const attributabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attributabilityPercent: z.number().min(0).max(100),
})
export type AttributabilityAdminStats = z.infer<typeof attributabilityAdminStatsSchema>

export const attributabilityAdminActionSchema = z.enum(['refresh_attributability_summary'])
export type AttributabilityAdminAction = z.infer<typeof attributabilityAdminActionSchema>

export const attributabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attributabilityAdminRecordSchema),
  stats: attributabilityAdminStatsSchema,
  availableActions: z.array(attributabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttributabilityAdminSummaryResponse = z.infer<
  typeof attributabilityAdminSummaryResponseSchema
>

export const attributabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attributabilityAdminActionSchema,
})
export type AttributabilityAdminActionRequest = z.infer<
  typeof attributabilityAdminActionRequestSchema
>

export const attributabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attributabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attributabilityAdminStatsSchema.optional(),
})
export type AttributabilityAdminActionResponse = z.infer<
  typeof attributabilityAdminActionResponseSchema
>
