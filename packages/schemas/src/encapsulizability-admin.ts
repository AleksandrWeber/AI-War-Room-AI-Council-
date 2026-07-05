import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const encapsulizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type EncapsulizabilityAdminDomain = z.infer<typeof encapsulizabilityAdminDomainSchema>

export const encapsulizabilityAdminRecordSchema = z.object({
  domain: encapsulizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EncapsulizabilityAdminRecord = z.infer<typeof encapsulizabilityAdminRecordSchema>

export const encapsulizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  encapsulizabilityPercent: z.number().min(0).max(100),
})
export type EncapsulizabilityAdminStats = z.infer<typeof encapsulizabilityAdminStatsSchema>

export const encapsulizabilityAdminActionSchema = z.enum(['refresh_encapsulizability_summary'])
export type EncapsulizabilityAdminAction = z.infer<typeof encapsulizabilityAdminActionSchema>

export const encapsulizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(encapsulizabilityAdminRecordSchema),
  stats: encapsulizabilityAdminStatsSchema,
  availableActions: z.array(encapsulizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EncapsulizabilityAdminSummaryResponse = z.infer<
  typeof encapsulizabilityAdminSummaryResponseSchema
>

export const encapsulizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: encapsulizabilityAdminActionSchema,
})
export type EncapsulizabilityAdminActionRequest = z.infer<
  typeof encapsulizabilityAdminActionRequestSchema
>

export const encapsulizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: encapsulizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: encapsulizabilityAdminStatsSchema.optional(),
})
export type EncapsulizabilityAdminActionResponse = z.infer<
  typeof encapsulizabilityAdminActionResponseSchema
>
