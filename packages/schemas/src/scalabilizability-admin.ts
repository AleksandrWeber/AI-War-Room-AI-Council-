import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scalabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ScalabilizabilityAdminDomain = z.infer<typeof scalabilizabilityAdminDomainSchema>

export const scalabilizabilityAdminRecordSchema = z.object({
  domain: scalabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScalabilizabilityAdminRecord = z.infer<typeof scalabilizabilityAdminRecordSchema>

export const scalabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scalabilizabilityPercent: z.number().min(0).max(100),
})
export type ScalabilizabilityAdminStats = z.infer<typeof scalabilizabilityAdminStatsSchema>

export const scalabilizabilityAdminActionSchema = z.enum(['refresh_scalabilizability_summary'])
export type ScalabilizabilityAdminAction = z.infer<typeof scalabilizabilityAdminActionSchema>

export const scalabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scalabilizabilityAdminRecordSchema),
  stats: scalabilizabilityAdminStatsSchema,
  availableActions: z.array(scalabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScalabilizabilityAdminSummaryResponse = z.infer<
  typeof scalabilizabilityAdminSummaryResponseSchema
>

export const scalabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalabilizabilityAdminActionSchema,
})
export type ScalabilizabilityAdminActionRequest = z.infer<
  typeof scalabilizabilityAdminActionRequestSchema
>

export const scalabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scalabilizabilityAdminStatsSchema.optional(),
})
export type ScalabilizabilityAdminActionResponse = z.infer<
  typeof scalabilizabilityAdminActionResponseSchema
>
