import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type IntegrabilizabilityAdminDomain = z.infer<typeof integrabilizabilityAdminDomainSchema>

export const integrabilizabilityAdminRecordSchema = z.object({
  domain: integrabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrabilizabilityAdminRecord = z.infer<typeof integrabilizabilityAdminRecordSchema>

export const integrabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrabilizabilityPercent: z.number().min(0).max(100),
})
export type IntegrabilizabilityAdminStats = z.infer<typeof integrabilizabilityAdminStatsSchema>

export const integrabilizabilityAdminActionSchema = z.enum(['refresh_integrabilizability_summary'])
export type IntegrabilizabilityAdminAction = z.infer<typeof integrabilizabilityAdminActionSchema>

export const integrabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrabilizabilityAdminRecordSchema),
  stats: integrabilizabilityAdminStatsSchema,
  availableActions: z.array(integrabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilizabilityAdminSummaryResponse = z.infer<
  typeof integrabilizabilityAdminSummaryResponseSchema
>

export const integrabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilizabilityAdminActionSchema,
})
export type IntegrabilizabilityAdminActionRequest = z.infer<
  typeof integrabilizabilityAdminActionRequestSchema
>

export const integrabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrabilizabilityAdminStatsSchema.optional(),
})
export type IntegrabilizabilityAdminActionResponse = z.infer<
  typeof integrabilizabilityAdminActionResponseSchema
>
