import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const validityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type ValidityAdminDomain = z.infer<typeof validityAdminDomainSchema>

export const validityAdminRecordSchema = z.object({
  domain: validityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ValidityAdminRecord = z.infer<typeof validityAdminRecordSchema>

export const validityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  validityPercent: z.number().min(0).max(100),
})
export type ValidityAdminStats = z.infer<typeof validityAdminStatsSchema>

export const validityAdminActionSchema = z.enum(['refresh_validity_summary'])
export type ValidityAdminAction = z.infer<typeof validityAdminActionSchema>

export const validityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(validityAdminRecordSchema),
  stats: validityAdminStatsSchema,
  availableActions: z.array(validityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ValidityAdminSummaryResponse = z.infer<
  typeof validityAdminSummaryResponseSchema
>

export const validityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: validityAdminActionSchema,
})
export type ValidityAdminActionRequest = z.infer<
  typeof validityAdminActionRequestSchema
>

export const validityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: validityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: validityAdminStatsSchema.optional(),
})
export type ValidityAdminActionResponse = z.infer<
  typeof validityAdminActionResponseSchema
>
