import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registrarproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type RegistrarproofizabilityAdminDomain = z.infer<typeof registrarproofizabilityAdminDomainSchema>

export const registrarproofizabilityAdminRecordSchema = z.object({
  domain: registrarproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistrarproofizabilityAdminRecord = z.infer<typeof registrarproofizabilityAdminRecordSchema>

export const registrarproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registrarproofizabilityPercent: z.number().min(0).max(100),
})
export type RegistrarproofizabilityAdminStats = z.infer<typeof registrarproofizabilityAdminStatsSchema>

export const registrarproofizabilityAdminActionSchema = z.enum(['refresh_registrarproofizability_summary'])
export type RegistrarproofizabilityAdminAction = z.infer<typeof registrarproofizabilityAdminActionSchema>

export const registrarproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registrarproofizabilityAdminRecordSchema),
  stats: registrarproofizabilityAdminStatsSchema,
  availableActions: z.array(registrarproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistrarproofizabilityAdminSummaryResponse = z.infer<
  typeof registrarproofizabilityAdminSummaryResponseSchema
>

export const registrarproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrarproofizabilityAdminActionSchema,
})
export type RegistrarproofizabilityAdminActionRequest = z.infer<
  typeof registrarproofizabilityAdminActionRequestSchema
>

export const registrarproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrarproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registrarproofizabilityAdminStatsSchema.optional(),
})
export type RegistrarproofizabilityAdminActionResponse = z.infer<
  typeof registrarproofizabilityAdminActionResponseSchema
>
