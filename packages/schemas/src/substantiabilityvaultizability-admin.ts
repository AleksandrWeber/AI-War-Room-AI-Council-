import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const substantiabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type SubstantiabilityvaultizabilityAdminDomain = z.infer<typeof substantiabilityvaultizabilityAdminDomainSchema>

export const substantiabilityvaultizabilityAdminRecordSchema = z.object({
  domain: substantiabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SubstantiabilityvaultizabilityAdminRecord = z.infer<typeof substantiabilityvaultizabilityAdminRecordSchema>

export const substantiabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  substantiabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type SubstantiabilityvaultizabilityAdminStats = z.infer<typeof substantiabilityvaultizabilityAdminStatsSchema>

export const substantiabilityvaultizabilityAdminActionSchema = z.enum(['refresh_substantiabilityvaultizability_summary'])
export type SubstantiabilityvaultizabilityAdminAction = z.infer<typeof substantiabilityvaultizabilityAdminActionSchema>

export const substantiabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(substantiabilityvaultizabilityAdminRecordSchema),
  stats: substantiabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(substantiabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SubstantiabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof substantiabilityvaultizabilityAdminSummaryResponseSchema
>

export const substantiabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: substantiabilityvaultizabilityAdminActionSchema,
})
export type SubstantiabilityvaultizabilityAdminActionRequest = z.infer<
  typeof substantiabilityvaultizabilityAdminActionRequestSchema
>

export const substantiabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: substantiabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: substantiabilityvaultizabilityAdminStatsSchema.optional(),
})
export type SubstantiabilityvaultizabilityAdminActionResponse = z.infer<
  typeof substantiabilityvaultizabilityAdminActionResponseSchema
>
