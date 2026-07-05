import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const caracterizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type CaracterizabilityAdminDomain = z.infer<typeof caracterizabilityAdminDomainSchema>

export const caracterizabilityAdminRecordSchema = z.object({
  domain: caracterizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CaracterizabilityAdminRecord = z.infer<typeof caracterizabilityAdminRecordSchema>

export const caracterizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  caracterizabilityPercent: z.number().min(0).max(100),
})
export type CaracterizabilityAdminStats = z.infer<typeof caracterizabilityAdminStatsSchema>

export const caracterizabilityAdminActionSchema = z.enum(['refresh_caracterizability_summary'])
export type CaracterizabilityAdminAction = z.infer<typeof caracterizabilityAdminActionSchema>

export const caracterizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(caracterizabilityAdminRecordSchema),
  stats: caracterizabilityAdminStatsSchema,
  availableActions: z.array(caracterizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CaracterizabilityAdminSummaryResponse = z.infer<
  typeof caracterizabilityAdminSummaryResponseSchema
>

export const caracterizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: caracterizabilityAdminActionSchema,
})
export type CaracterizabilityAdminActionRequest = z.infer<
  typeof caracterizabilityAdminActionRequestSchema
>

export const caracterizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: caracterizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: caracterizabilityAdminStatsSchema.optional(),
})
export type CaracterizabilityAdminActionResponse = z.infer<
  typeof caracterizabilityAdminActionResponseSchema
>
