import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const controllabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ControllabilityvaultizabilityAdminDomain = z.infer<typeof controllabilityvaultizabilityAdminDomainSchema>

export const controllabilityvaultizabilityAdminRecordSchema = z.object({
  domain: controllabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ControllabilityvaultizabilityAdminRecord = z.infer<typeof controllabilityvaultizabilityAdminRecordSchema>

export const controllabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  controllabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ControllabilityvaultizabilityAdminStats = z.infer<typeof controllabilityvaultizabilityAdminStatsSchema>

export const controllabilityvaultizabilityAdminActionSchema = z.enum(['refresh_controllabilityvaultizability_summary'])
export type ControllabilityvaultizabilityAdminAction = z.infer<typeof controllabilityvaultizabilityAdminActionSchema>

export const controllabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(controllabilityvaultizabilityAdminRecordSchema),
  stats: controllabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(controllabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ControllabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof controllabilityvaultizabilityAdminSummaryResponseSchema
>

export const controllabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controllabilityvaultizabilityAdminActionSchema,
})
export type ControllabilityvaultizabilityAdminActionRequest = z.infer<
  typeof controllabilityvaultizabilityAdminActionRequestSchema
>

export const controllabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controllabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: controllabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ControllabilityvaultizabilityAdminActionResponse = z.infer<
  typeof controllabilityvaultizabilityAdminActionResponseSchema
>
