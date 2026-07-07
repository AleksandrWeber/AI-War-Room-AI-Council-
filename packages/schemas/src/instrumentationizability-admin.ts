import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const instrumentationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type InstrumentationizabilityAdminDomain = z.infer<typeof instrumentationizabilityAdminDomainSchema>

export const instrumentationizabilityAdminRecordSchema = z.object({
  domain: instrumentationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InstrumentationizabilityAdminRecord = z.infer<typeof instrumentationizabilityAdminRecordSchema>

export const instrumentationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  instrumentationizabilityPercent: z.number().min(0).max(100),
})
export type InstrumentationizabilityAdminStats = z.infer<typeof instrumentationizabilityAdminStatsSchema>

export const instrumentationizabilityAdminActionSchema = z.enum(['refresh_instrumentationizability_summary'])
export type InstrumentationizabilityAdminAction = z.infer<typeof instrumentationizabilityAdminActionSchema>

export const instrumentationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(instrumentationizabilityAdminRecordSchema),
  stats: instrumentationizabilityAdminStatsSchema,
  availableActions: z.array(instrumentationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InstrumentationizabilityAdminSummaryResponse = z.infer<
  typeof instrumentationizabilityAdminSummaryResponseSchema
>

export const instrumentationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: instrumentationizabilityAdminActionSchema,
})
export type InstrumentationizabilityAdminActionRequest = z.infer<
  typeof instrumentationizabilityAdminActionRequestSchema
>

export const instrumentationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: instrumentationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: instrumentationizabilityAdminStatsSchema.optional(),
})
export type InstrumentationizabilityAdminActionResponse = z.infer<
  typeof instrumentationizabilityAdminActionResponseSchema
>
