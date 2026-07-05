import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const materializabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'artifacts',
])
export type MaterializabilityAdminDomain = z.infer<typeof materializabilityAdminDomainSchema>

export const materializabilityAdminRecordSchema = z.object({
  domain: materializabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MaterializabilityAdminRecord = z.infer<typeof materializabilityAdminRecordSchema>

export const materializabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  materializabilityPercent: z.number().min(0).max(100),
})
export type MaterializabilityAdminStats = z.infer<typeof materializabilityAdminStatsSchema>

export const materializabilityAdminActionSchema = z.enum(['refresh_materializability_summary'])
export type MaterializabilityAdminAction = z.infer<typeof materializabilityAdminActionSchema>

export const materializabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(materializabilityAdminRecordSchema),
  stats: materializabilityAdminStatsSchema,
  availableActions: z.array(materializabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MaterializabilityAdminSummaryResponse = z.infer<
  typeof materializabilityAdminSummaryResponseSchema
>

export const materializabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: materializabilityAdminActionSchema,
})
export type MaterializabilityAdminActionRequest = z.infer<
  typeof materializabilityAdminActionRequestSchema
>

export const materializabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: materializabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: materializabilityAdminStatsSchema.optional(),
})
export type MaterializabilityAdminActionResponse = z.infer<
  typeof materializabilityAdminActionResponseSchema
>
