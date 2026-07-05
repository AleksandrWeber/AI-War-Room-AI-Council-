import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const substantiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'idempotency_keys',
])
export type SubstantiabilityAdminDomain = z.infer<typeof substantiabilityAdminDomainSchema>

export const substantiabilityAdminRecordSchema = z.object({
  domain: substantiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SubstantiabilityAdminRecord = z.infer<typeof substantiabilityAdminRecordSchema>

export const substantiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  substantiabilityPercent: z.number().min(0).max(100),
})
export type SubstantiabilityAdminStats = z.infer<typeof substantiabilityAdminStatsSchema>

export const substantiabilityAdminActionSchema = z.enum(['refresh_substantiability_summary'])
export type SubstantiabilityAdminAction = z.infer<typeof substantiabilityAdminActionSchema>

export const substantiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(substantiabilityAdminRecordSchema),
  stats: substantiabilityAdminStatsSchema,
  availableActions: z.array(substantiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SubstantiabilityAdminSummaryResponse = z.infer<
  typeof substantiabilityAdminSummaryResponseSchema
>

export const substantiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: substantiabilityAdminActionSchema,
})
export type SubstantiabilityAdminActionRequest = z.infer<
  typeof substantiabilityAdminActionRequestSchema
>

export const substantiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: substantiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: substantiabilityAdminStatsSchema.optional(),
})
export type SubstantiabilityAdminActionResponse = z.infer<
  typeof substantiabilityAdminActionResponseSchema
>
