import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const elaboratabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type ElaboratabilityAdminDomain = z.infer<typeof elaboratabilityAdminDomainSchema>

export const elaboratabilityAdminRecordSchema = z.object({
  domain: elaboratabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ElaboratabilityAdminRecord = z.infer<typeof elaboratabilityAdminRecordSchema>

export const elaboratabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  elaboratabilityPercent: z.number().min(0).max(100),
})
export type ElaboratabilityAdminStats = z.infer<typeof elaboratabilityAdminStatsSchema>

export const elaboratabilityAdminActionSchema = z.enum(['refresh_elaboratability_summary'])
export type ElaboratabilityAdminAction = z.infer<typeof elaboratabilityAdminActionSchema>

export const elaboratabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(elaboratabilityAdminRecordSchema),
  stats: elaboratabilityAdminStatsSchema,
  availableActions: z.array(elaboratabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ElaboratabilityAdminSummaryResponse = z.infer<
  typeof elaboratabilityAdminSummaryResponseSchema
>

export const elaboratabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: elaboratabilityAdminActionSchema,
})
export type ElaboratabilityAdminActionRequest = z.infer<
  typeof elaboratabilityAdminActionRequestSchema
>

export const elaboratabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: elaboratabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: elaboratabilityAdminStatsSchema.optional(),
})
export type ElaboratabilityAdminActionResponse = z.infer<
  typeof elaboratabilityAdminActionResponseSchema
>
