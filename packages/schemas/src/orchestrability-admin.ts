import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const orchestrabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'billing_notifications',
])
export type OrchestrabilityAdminDomain = z.infer<typeof orchestrabilityAdminDomainSchema>

export const orchestrabilityAdminRecordSchema = z.object({
  domain: orchestrabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrchestrabilityAdminRecord = z.infer<typeof orchestrabilityAdminRecordSchema>

export const orchestrabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  orchestrabilityPercent: z.number().min(0).max(100),
})
export type OrchestrabilityAdminStats = z.infer<typeof orchestrabilityAdminStatsSchema>

export const orchestrabilityAdminActionSchema = z.enum(['refresh_orchestrability_summary'])
export type OrchestrabilityAdminAction = z.infer<typeof orchestrabilityAdminActionSchema>

export const orchestrabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(orchestrabilityAdminRecordSchema),
  stats: orchestrabilityAdminStatsSchema,
  availableActions: z.array(orchestrabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrchestrabilityAdminSummaryResponse = z.infer<
  typeof orchestrabilityAdminSummaryResponseSchema
>

export const orchestrabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrabilityAdminActionSchema,
})
export type OrchestrabilityAdminActionRequest = z.infer<
  typeof orchestrabilityAdminActionRequestSchema
>

export const orchestrabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: orchestrabilityAdminStatsSchema.optional(),
})
export type OrchestrabilityAdminActionResponse = z.infer<
  typeof orchestrabilityAdminActionResponseSchema
>
