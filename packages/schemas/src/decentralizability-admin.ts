import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const decentralizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type DecentralizabilityAdminDomain = z.infer<typeof decentralizabilityAdminDomainSchema>

export const decentralizabilityAdminRecordSchema = z.object({
  domain: decentralizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DecentralizabilityAdminRecord = z.infer<typeof decentralizabilityAdminRecordSchema>

export const decentralizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  decentralizabilityPercent: z.number().min(0).max(100),
})
export type DecentralizabilityAdminStats = z.infer<typeof decentralizabilityAdminStatsSchema>

export const decentralizabilityAdminActionSchema = z.enum(['refresh_decentralizability_summary'])
export type DecentralizabilityAdminAction = z.infer<typeof decentralizabilityAdminActionSchema>

export const decentralizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(decentralizabilityAdminRecordSchema),
  stats: decentralizabilityAdminStatsSchema,
  availableActions: z.array(decentralizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DecentralizabilityAdminSummaryResponse = z.infer<
  typeof decentralizabilityAdminSummaryResponseSchema
>

export const decentralizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: decentralizabilityAdminActionSchema,
})
export type DecentralizabilityAdminActionRequest = z.infer<
  typeof decentralizabilityAdminActionRequestSchema
>

export const decentralizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: decentralizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: decentralizabilityAdminStatsSchema.optional(),
})
export type DecentralizabilityAdminActionResponse = z.infer<
  typeof decentralizabilityAdminActionResponseSchema
>
