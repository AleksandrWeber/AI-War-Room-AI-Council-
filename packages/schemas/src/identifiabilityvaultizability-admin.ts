import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const identifiabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type IdentifiabilityvaultizabilityAdminDomain = z.infer<typeof identifiabilityvaultizabilityAdminDomainSchema>

export const identifiabilityvaultizabilityAdminRecordSchema = z.object({
  domain: identifiabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IdentifiabilityvaultizabilityAdminRecord = z.infer<typeof identifiabilityvaultizabilityAdminRecordSchema>

export const identifiabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  identifiabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type IdentifiabilityvaultizabilityAdminStats = z.infer<typeof identifiabilityvaultizabilityAdminStatsSchema>

export const identifiabilityvaultizabilityAdminActionSchema = z.enum(['refresh_identifiabilityvaultizability_summary'])
export type IdentifiabilityvaultizabilityAdminAction = z.infer<typeof identifiabilityvaultizabilityAdminActionSchema>

export const identifiabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(identifiabilityvaultizabilityAdminRecordSchema),
  stats: identifiabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(identifiabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IdentifiabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof identifiabilityvaultizabilityAdminSummaryResponseSchema
>

export const identifiabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identifiabilityvaultizabilityAdminActionSchema,
})
export type IdentifiabilityvaultizabilityAdminActionRequest = z.infer<
  typeof identifiabilityvaultizabilityAdminActionRequestSchema
>

export const identifiabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identifiabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: identifiabilityvaultizabilityAdminStatsSchema.optional(),
})
export type IdentifiabilityvaultizabilityAdminActionResponse = z.infer<
  typeof identifiabilityvaultizabilityAdminActionResponseSchema
>
