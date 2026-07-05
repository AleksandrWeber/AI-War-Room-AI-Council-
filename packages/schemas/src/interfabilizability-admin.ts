import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interfabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type InterfabilizabilityAdminDomain = z.infer<typeof interfabilizabilityAdminDomainSchema>

export const interfabilizabilityAdminRecordSchema = z.object({
  domain: interfabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InterfabilizabilityAdminRecord = z.infer<typeof interfabilizabilityAdminRecordSchema>

export const interfabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interfabilizabilityPercent: z.number().min(0).max(100),
})
export type InterfabilizabilityAdminStats = z.infer<typeof interfabilizabilityAdminStatsSchema>

export const interfabilizabilityAdminActionSchema = z.enum(['refresh_interfabilizability_summary'])
export type InterfabilizabilityAdminAction = z.infer<typeof interfabilizabilityAdminActionSchema>

export const interfabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interfabilizabilityAdminRecordSchema),
  stats: interfabilizabilityAdminStatsSchema,
  availableActions: z.array(interfabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InterfabilizabilityAdminSummaryResponse = z.infer<
  typeof interfabilizabilityAdminSummaryResponseSchema
>

export const interfabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interfabilizabilityAdminActionSchema,
})
export type InterfabilizabilityAdminActionRequest = z.infer<
  typeof interfabilizabilityAdminActionRequestSchema
>

export const interfabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interfabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interfabilizabilityAdminStatsSchema.optional(),
})
export type InterfabilizabilityAdminActionResponse = z.infer<
  typeof interfabilizabilityAdminActionResponseSchema
>
