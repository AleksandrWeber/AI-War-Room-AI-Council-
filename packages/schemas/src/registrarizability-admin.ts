import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registrarizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type RegistrarizabilityAdminDomain = z.infer<typeof registrarizabilityAdminDomainSchema>

export const registrarizabilityAdminRecordSchema = z.object({
  domain: registrarizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistrarizabilityAdminRecord = z.infer<typeof registrarizabilityAdminRecordSchema>

export const registrarizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registrarizabilityPercent: z.number().min(0).max(100),
})
export type RegistrarizabilityAdminStats = z.infer<typeof registrarizabilityAdminStatsSchema>

export const registrarizabilityAdminActionSchema = z.enum(['refresh_registrarizability_summary'])
export type RegistrarizabilityAdminAction = z.infer<typeof registrarizabilityAdminActionSchema>

export const registrarizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registrarizabilityAdminRecordSchema),
  stats: registrarizabilityAdminStatsSchema,
  availableActions: z.array(registrarizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistrarizabilityAdminSummaryResponse = z.infer<
  typeof registrarizabilityAdminSummaryResponseSchema
>

export const registrarizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrarizabilityAdminActionSchema,
})
export type RegistrarizabilityAdminActionRequest = z.infer<
  typeof registrarizabilityAdminActionRequestSchema
>

export const registrarizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrarizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registrarizabilityAdminStatsSchema.optional(),
})
export type RegistrarizabilityAdminActionResponse = z.infer<
  typeof registrarizabilityAdminActionResponseSchema
>
