import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const provenancevaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ProvenancevaultizabilityAdminDomain = z.infer<typeof provenancevaultizabilityAdminDomainSchema>

export const provenancevaultizabilityAdminRecordSchema = z.object({
  domain: provenancevaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProvenancevaultizabilityAdminRecord = z.infer<typeof provenancevaultizabilityAdminRecordSchema>

export const provenancevaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  provenancevaultizabilityPercent: z.number().min(0).max(100),
})
export type ProvenancevaultizabilityAdminStats = z.infer<typeof provenancevaultizabilityAdminStatsSchema>

export const provenancevaultizabilityAdminActionSchema = z.enum(['refresh_provenancevaultizability_summary'])
export type ProvenancevaultizabilityAdminAction = z.infer<typeof provenancevaultizabilityAdminActionSchema>

export const provenancevaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(provenancevaultizabilityAdminRecordSchema),
  stats: provenancevaultizabilityAdminStatsSchema,
  availableActions: z.array(provenancevaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProvenancevaultizabilityAdminSummaryResponse = z.infer<
  typeof provenancevaultizabilityAdminSummaryResponseSchema
>

export const provenancevaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenancevaultizabilityAdminActionSchema,
})
export type ProvenancevaultizabilityAdminActionRequest = z.infer<
  typeof provenancevaultizabilityAdminActionRequestSchema
>

export const provenancevaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenancevaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: provenancevaultizabilityAdminStatsSchema.optional(),
})
export type ProvenancevaultizabilityAdminActionResponse = z.infer<
  typeof provenancevaultizabilityAdminActionResponseSchema
>
