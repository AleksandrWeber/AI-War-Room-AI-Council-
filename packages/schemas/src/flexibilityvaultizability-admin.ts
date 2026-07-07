import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const flexibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type FlexibilityvaultizabilityAdminDomain = z.infer<typeof flexibilityvaultizabilityAdminDomainSchema>

export const flexibilityvaultizabilityAdminRecordSchema = z.object({
  domain: flexibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FlexibilityvaultizabilityAdminRecord = z.infer<typeof flexibilityvaultizabilityAdminRecordSchema>

export const flexibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  flexibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type FlexibilityvaultizabilityAdminStats = z.infer<typeof flexibilityvaultizabilityAdminStatsSchema>

export const flexibilityvaultizabilityAdminActionSchema = z.enum(['refresh_flexibilityvaultizability_summary'])
export type FlexibilityvaultizabilityAdminAction = z.infer<typeof flexibilityvaultizabilityAdminActionSchema>

export const flexibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(flexibilityvaultizabilityAdminRecordSchema),
  stats: flexibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(flexibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FlexibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof flexibilityvaultizabilityAdminSummaryResponseSchema
>

export const flexibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: flexibilityvaultizabilityAdminActionSchema,
})
export type FlexibilityvaultizabilityAdminActionRequest = z.infer<
  typeof flexibilityvaultizabilityAdminActionRequestSchema
>

export const flexibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: flexibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: flexibilityvaultizabilityAdminStatsSchema.optional(),
})
export type FlexibilityvaultizabilityAdminActionResponse = z.infer<
  typeof flexibilityvaultizabilityAdminActionResponseSchema
>
