import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const linkabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type LinkabilityvaultizabilityAdminDomain = z.infer<typeof linkabilityvaultizabilityAdminDomainSchema>

export const linkabilityvaultizabilityAdminRecordSchema = z.object({
  domain: linkabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LinkabilityvaultizabilityAdminRecord = z.infer<typeof linkabilityvaultizabilityAdminRecordSchema>

export const linkabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  linkabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type LinkabilityvaultizabilityAdminStats = z.infer<typeof linkabilityvaultizabilityAdminStatsSchema>

export const linkabilityvaultizabilityAdminActionSchema = z.enum(['refresh_linkabilityvaultizability_summary'])
export type LinkabilityvaultizabilityAdminAction = z.infer<typeof linkabilityvaultizabilityAdminActionSchema>

export const linkabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(linkabilityvaultizabilityAdminRecordSchema),
  stats: linkabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(linkabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LinkabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof linkabilityvaultizabilityAdminSummaryResponseSchema
>

export const linkabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: linkabilityvaultizabilityAdminActionSchema,
})
export type LinkabilityvaultizabilityAdminActionRequest = z.infer<
  typeof linkabilityvaultizabilityAdminActionRequestSchema
>

export const linkabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: linkabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: linkabilityvaultizabilityAdminStatsSchema.optional(),
})
export type LinkabilityvaultizabilityAdminActionResponse = z.infer<
  typeof linkabilityvaultizabilityAdminActionResponseSchema
>
