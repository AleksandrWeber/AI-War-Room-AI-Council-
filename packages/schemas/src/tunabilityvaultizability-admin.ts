import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tunabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type TunabilityvaultizabilityAdminDomain = z.infer<typeof tunabilityvaultizabilityAdminDomainSchema>

export const tunabilityvaultizabilityAdminRecordSchema = z.object({
  domain: tunabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TunabilityvaultizabilityAdminRecord = z.infer<typeof tunabilityvaultizabilityAdminRecordSchema>

export const tunabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tunabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type TunabilityvaultizabilityAdminStats = z.infer<typeof tunabilityvaultizabilityAdminStatsSchema>

export const tunabilityvaultizabilityAdminActionSchema = z.enum(['refresh_tunabilityvaultizability_summary'])
export type TunabilityvaultizabilityAdminAction = z.infer<typeof tunabilityvaultizabilityAdminActionSchema>

export const tunabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tunabilityvaultizabilityAdminRecordSchema),
  stats: tunabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(tunabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TunabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof tunabilityvaultizabilityAdminSummaryResponseSchema
>

export const tunabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tunabilityvaultizabilityAdminActionSchema,
})
export type TunabilityvaultizabilityAdminActionRequest = z.infer<
  typeof tunabilityvaultizabilityAdminActionRequestSchema
>

export const tunabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tunabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tunabilityvaultizabilityAdminStatsSchema.optional(),
})
export type TunabilityvaultizabilityAdminActionResponse = z.infer<
  typeof tunabilityvaultizabilityAdminActionResponseSchema
>
