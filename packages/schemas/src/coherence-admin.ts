import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const coherenceAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type CoherenceAdminDomain = z.infer<typeof coherenceAdminDomainSchema>

export const coherenceAdminRecordSchema = z.object({
  domain: coherenceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CoherenceAdminRecord = z.infer<typeof coherenceAdminRecordSchema>

export const coherenceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  coherencePercent: z.number().min(0).max(100),
})
export type CoherenceAdminStats = z.infer<typeof coherenceAdminStatsSchema>

export const coherenceAdminActionSchema = z.enum(['refresh_coherence_summary'])
export type CoherenceAdminAction = z.infer<typeof coherenceAdminActionSchema>

export const coherenceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(coherenceAdminRecordSchema),
  stats: coherenceAdminStatsSchema,
  availableActions: z.array(coherenceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CoherenceAdminSummaryResponse = z.infer<
  typeof coherenceAdminSummaryResponseSchema
>

export const coherenceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coherenceAdminActionSchema,
})
export type CoherenceAdminActionRequest = z.infer<
  typeof coherenceAdminActionRequestSchema
>

export const coherenceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coherenceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: coherenceAdminStatsSchema.optional(),
})
export type CoherenceAdminActionResponse = z.infer<
  typeof coherenceAdminActionResponseSchema
>
