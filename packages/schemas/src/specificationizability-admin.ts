import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const specificationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type SpecificationizabilityAdminDomain = z.infer<typeof specificationizabilityAdminDomainSchema>

export const specificationizabilityAdminRecordSchema = z.object({
  domain: specificationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SpecificationizabilityAdminRecord = z.infer<typeof specificationizabilityAdminRecordSchema>

export const specificationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  specificationizabilityPercent: z.number().min(0).max(100),
})
export type SpecificationizabilityAdminStats = z.infer<typeof specificationizabilityAdminStatsSchema>

export const specificationizabilityAdminActionSchema = z.enum(['refresh_specificationizability_summary'])
export type SpecificationizabilityAdminAction = z.infer<typeof specificationizabilityAdminActionSchema>

export const specificationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(specificationizabilityAdminRecordSchema),
  stats: specificationizabilityAdminStatsSchema,
  availableActions: z.array(specificationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SpecificationizabilityAdminSummaryResponse = z.infer<
  typeof specificationizabilityAdminSummaryResponseSchema
>

export const specificationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: specificationizabilityAdminActionSchema,
})
export type SpecificationizabilityAdminActionRequest = z.infer<
  typeof specificationizabilityAdminActionRequestSchema
>

export const specificationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: specificationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: specificationizabilityAdminStatsSchema.optional(),
})
export type SpecificationizabilityAdminActionResponse = z.infer<
  typeof specificationizabilityAdminActionResponseSchema
>
