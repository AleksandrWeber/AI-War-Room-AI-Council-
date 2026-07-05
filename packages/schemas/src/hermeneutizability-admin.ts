import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const hermeneutizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type HermeneutizabilityAdminDomain = z.infer<typeof hermeneutizabilityAdminDomainSchema>

export const hermeneutizabilityAdminRecordSchema = z.object({
  domain: hermeneutizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HermeneutizabilityAdminRecord = z.infer<typeof hermeneutizabilityAdminRecordSchema>

export const hermeneutizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  hermeneutizabilityPercent: z.number().min(0).max(100),
})
export type HermeneutizabilityAdminStats = z.infer<typeof hermeneutizabilityAdminStatsSchema>

export const hermeneutizabilityAdminActionSchema = z.enum(['refresh_hermeneutizability_summary'])
export type HermeneutizabilityAdminAction = z.infer<typeof hermeneutizabilityAdminActionSchema>

export const hermeneutizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(hermeneutizabilityAdminRecordSchema),
  stats: hermeneutizabilityAdminStatsSchema,
  availableActions: z.array(hermeneutizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HermeneutizabilityAdminSummaryResponse = z.infer<
  typeof hermeneutizabilityAdminSummaryResponseSchema
>

export const hermeneutizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hermeneutizabilityAdminActionSchema,
})
export type HermeneutizabilityAdminActionRequest = z.infer<
  typeof hermeneutizabilityAdminActionRequestSchema
>

export const hermeneutizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hermeneutizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: hermeneutizabilityAdminStatsSchema.optional(),
})
export type HermeneutizabilityAdminActionResponse = z.infer<
  typeof hermeneutizabilityAdminActionResponseSchema
>
