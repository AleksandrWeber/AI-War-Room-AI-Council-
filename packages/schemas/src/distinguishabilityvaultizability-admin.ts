import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const distinguishabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type DistinguishabilityvaultizabilityAdminDomain = z.infer<typeof distinguishabilityvaultizabilityAdminDomainSchema>

export const distinguishabilityvaultizabilityAdminRecordSchema = z.object({
  domain: distinguishabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DistinguishabilityvaultizabilityAdminRecord = z.infer<typeof distinguishabilityvaultizabilityAdminRecordSchema>

export const distinguishabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  distinguishabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DistinguishabilityvaultizabilityAdminStats = z.infer<typeof distinguishabilityvaultizabilityAdminStatsSchema>

export const distinguishabilityvaultizabilityAdminActionSchema = z.enum(['refresh_distinguishabilityvaultizability_summary'])
export type DistinguishabilityvaultizabilityAdminAction = z.infer<typeof distinguishabilityvaultizabilityAdminActionSchema>

export const distinguishabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(distinguishabilityvaultizabilityAdminRecordSchema),
  stats: distinguishabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(distinguishabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DistinguishabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof distinguishabilityvaultizabilityAdminSummaryResponseSchema
>

export const distinguishabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinguishabilityvaultizabilityAdminActionSchema,
})
export type DistinguishabilityvaultizabilityAdminActionRequest = z.infer<
  typeof distinguishabilityvaultizabilityAdminActionRequestSchema
>

export const distinguishabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinguishabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: distinguishabilityvaultizabilityAdminStatsSchema.optional(),
})
export type DistinguishabilityvaultizabilityAdminActionResponse = z.infer<
  typeof distinguishabilityvaultizabilityAdminActionResponseSchema
>
