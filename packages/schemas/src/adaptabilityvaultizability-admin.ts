import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adaptabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AdaptabilityvaultizabilityAdminDomain = z.infer<typeof adaptabilityvaultizabilityAdminDomainSchema>

export const adaptabilityvaultizabilityAdminRecordSchema = z.object({
  domain: adaptabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdaptabilityvaultizabilityAdminRecord = z.infer<typeof adaptabilityvaultizabilityAdminRecordSchema>

export const adaptabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adaptabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AdaptabilityvaultizabilityAdminStats = z.infer<typeof adaptabilityvaultizabilityAdminStatsSchema>

export const adaptabilityvaultizabilityAdminActionSchema = z.enum(['refresh_adaptabilityvaultizability_summary'])
export type AdaptabilityvaultizabilityAdminAction = z.infer<typeof adaptabilityvaultizabilityAdminActionSchema>

export const adaptabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adaptabilityvaultizabilityAdminRecordSchema),
  stats: adaptabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(adaptabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdaptabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof adaptabilityvaultizabilityAdminSummaryResponseSchema
>

export const adaptabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptabilityvaultizabilityAdminActionSchema,
})
export type AdaptabilityvaultizabilityAdminActionRequest = z.infer<
  typeof adaptabilityvaultizabilityAdminActionRequestSchema
>

export const adaptabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adaptabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adaptabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AdaptabilityvaultizabilityAdminActionResponse = z.infer<
  typeof adaptabilityvaultizabilityAdminActionResponseSchema
>
