import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AuditvaultizabilityAdminDomain = z.infer<typeof auditvaultizabilityAdminDomainSchema>

export const auditvaultizabilityAdminRecordSchema = z.object({
  domain: auditvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditvaultizabilityAdminRecord = z.infer<typeof auditvaultizabilityAdminRecordSchema>

export const auditvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditvaultizabilityPercent: z.number().min(0).max(100),
})
export type AuditvaultizabilityAdminStats = z.infer<typeof auditvaultizabilityAdminStatsSchema>

export const auditvaultizabilityAdminActionSchema = z.enum(['refresh_auditvaultizability_summary'])
export type AuditvaultizabilityAdminAction = z.infer<typeof auditvaultizabilityAdminActionSchema>

export const auditvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditvaultizabilityAdminRecordSchema),
  stats: auditvaultizabilityAdminStatsSchema,
  availableActions: z.array(auditvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditvaultizabilityAdminSummaryResponse = z.infer<
  typeof auditvaultizabilityAdminSummaryResponseSchema
>

export const auditvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditvaultizabilityAdminActionSchema,
})
export type AuditvaultizabilityAdminActionRequest = z.infer<
  typeof auditvaultizabilityAdminActionRequestSchema
>

export const auditvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditvaultizabilityAdminStatsSchema.optional(),
})
export type AuditvaultizabilityAdminActionResponse = z.infer<
  typeof auditvaultizabilityAdminActionResponseSchema
>
