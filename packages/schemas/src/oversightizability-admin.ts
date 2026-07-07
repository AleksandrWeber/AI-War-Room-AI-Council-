import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const oversightizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type OversightizabilityAdminDomain = z.infer<typeof oversightizabilityAdminDomainSchema>

export const oversightizabilityAdminRecordSchema = z.object({
  domain: oversightizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OversightizabilityAdminRecord = z.infer<typeof oversightizabilityAdminRecordSchema>

export const oversightizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  oversightizabilityPercent: z.number().min(0).max(100),
})
export type OversightizabilityAdminStats = z.infer<typeof oversightizabilityAdminStatsSchema>

export const oversightizabilityAdminActionSchema = z.enum(['refresh_oversightizability_summary'])
export type OversightizabilityAdminAction = z.infer<typeof oversightizabilityAdminActionSchema>

export const oversightizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(oversightizabilityAdminRecordSchema),
  stats: oversightizabilityAdminStatsSchema,
  availableActions: z.array(oversightizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OversightizabilityAdminSummaryResponse = z.infer<
  typeof oversightizabilityAdminSummaryResponseSchema
>

export const oversightizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: oversightizabilityAdminActionSchema,
})
export type OversightizabilityAdminActionRequest = z.infer<
  typeof oversightizabilityAdminActionRequestSchema
>

export const oversightizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: oversightizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: oversightizabilityAdminStatsSchema.optional(),
})
export type OversightizabilityAdminActionResponse = z.infer<
  typeof oversightizabilityAdminActionResponseSchema
>
