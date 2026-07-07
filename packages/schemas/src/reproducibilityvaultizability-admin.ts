import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reproducibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ReproducibilityvaultizabilityAdminDomain = z.infer<typeof reproducibilityvaultizabilityAdminDomainSchema>

export const reproducibilityvaultizabilityAdminRecordSchema = z.object({
  domain: reproducibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReproducibilityvaultizabilityAdminRecord = z.infer<typeof reproducibilityvaultizabilityAdminRecordSchema>

export const reproducibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reproducibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ReproducibilityvaultizabilityAdminStats = z.infer<typeof reproducibilityvaultizabilityAdminStatsSchema>

export const reproducibilityvaultizabilityAdminActionSchema = z.enum(['refresh_reproducibilityvaultizability_summary'])
export type ReproducibilityvaultizabilityAdminAction = z.infer<typeof reproducibilityvaultizabilityAdminActionSchema>

export const reproducibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reproducibilityvaultizabilityAdminRecordSchema),
  stats: reproducibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(reproducibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReproducibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof reproducibilityvaultizabilityAdminSummaryResponseSchema
>

export const reproducibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reproducibilityvaultizabilityAdminActionSchema,
})
export type ReproducibilityvaultizabilityAdminActionRequest = z.infer<
  typeof reproducibilityvaultizabilityAdminActionRequestSchema
>

export const reproducibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reproducibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reproducibilityvaultizabilityAdminStatsSchema.optional(),
})
export type ReproducibilityvaultizabilityAdminActionResponse = z.infer<
  typeof reproducibilityvaultizabilityAdminActionResponseSchema
>
