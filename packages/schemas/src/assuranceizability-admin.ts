import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assuranceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AssuranceizabilityAdminDomain = z.infer<typeof assuranceizabilityAdminDomainSchema>

export const assuranceizabilityAdminRecordSchema = z.object({
  domain: assuranceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssuranceizabilityAdminRecord = z.infer<typeof assuranceizabilityAdminRecordSchema>

export const assuranceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assuranceizabilityPercent: z.number().min(0).max(100),
})
export type AssuranceizabilityAdminStats = z.infer<typeof assuranceizabilityAdminStatsSchema>

export const assuranceizabilityAdminActionSchema = z.enum(['refresh_assuranceizability_summary'])
export type AssuranceizabilityAdminAction = z.infer<typeof assuranceizabilityAdminActionSchema>

export const assuranceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assuranceizabilityAdminRecordSchema),
  stats: assuranceizabilityAdminStatsSchema,
  availableActions: z.array(assuranceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssuranceizabilityAdminSummaryResponse = z.infer<
  typeof assuranceizabilityAdminSummaryResponseSchema
>

export const assuranceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assuranceizabilityAdminActionSchema,
})
export type AssuranceizabilityAdminActionRequest = z.infer<
  typeof assuranceizabilityAdminActionRequestSchema
>

export const assuranceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assuranceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assuranceizabilityAdminStatsSchema.optional(),
})
export type AssuranceizabilityAdminActionResponse = z.infer<
  typeof assuranceizabilityAdminActionResponseSchema
>
