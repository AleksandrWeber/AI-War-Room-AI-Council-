import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const simulatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type SimulatizabilityAdminDomain = z.infer<typeof simulatizabilityAdminDomainSchema>

export const simulatizabilityAdminRecordSchema = z.object({
  domain: simulatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SimulatizabilityAdminRecord = z.infer<typeof simulatizabilityAdminRecordSchema>

export const simulatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  simulatizabilityPercent: z.number().min(0).max(100),
})
export type SimulatizabilityAdminStats = z.infer<typeof simulatizabilityAdminStatsSchema>

export const simulatizabilityAdminActionSchema = z.enum(['refresh_simulatizability_summary'])
export type SimulatizabilityAdminAction = z.infer<typeof simulatizabilityAdminActionSchema>

export const simulatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(simulatizabilityAdminRecordSchema),
  stats: simulatizabilityAdminStatsSchema,
  availableActions: z.array(simulatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SimulatizabilityAdminSummaryResponse = z.infer<
  typeof simulatizabilityAdminSummaryResponseSchema
>

export const simulatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: simulatizabilityAdminActionSchema,
})
export type SimulatizabilityAdminActionRequest = z.infer<
  typeof simulatizabilityAdminActionRequestSchema
>

export const simulatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: simulatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: simulatizabilityAdminStatsSchema.optional(),
})
export type SimulatizabilityAdminActionResponse = z.infer<
  typeof simulatizabilityAdminActionResponseSchema
>
