import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const referencabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'billing_records',
])
export type ReferencabilityAdminDomain = z.infer<typeof referencabilityAdminDomainSchema>

export const referencabilityAdminRecordSchema = z.object({
  domain: referencabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReferencabilityAdminRecord = z.infer<typeof referencabilityAdminRecordSchema>

export const referencabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  referencabilityPercent: z.number().min(0).max(100),
})
export type ReferencabilityAdminStats = z.infer<typeof referencabilityAdminStatsSchema>

export const referencabilityAdminActionSchema = z.enum(['refresh_referencability_summary'])
export type ReferencabilityAdminAction = z.infer<typeof referencabilityAdminActionSchema>

export const referencabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(referencabilityAdminRecordSchema),
  stats: referencabilityAdminStatsSchema,
  availableActions: z.array(referencabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReferencabilityAdminSummaryResponse = z.infer<
  typeof referencabilityAdminSummaryResponseSchema
>

export const referencabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencabilityAdminActionSchema,
})
export type ReferencabilityAdminActionRequest = z.infer<
  typeof referencabilityAdminActionRequestSchema
>

export const referencabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: referencabilityAdminStatsSchema.optional(),
})
export type ReferencabilityAdminActionResponse = z.infer<
  typeof referencabilityAdminActionResponseSchema
>
