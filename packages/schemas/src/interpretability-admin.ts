import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interpretabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'moderator_syntheses',
])
export type InterpretabilityAdminDomain = z.infer<typeof interpretabilityAdminDomainSchema>

export const interpretabilityAdminRecordSchema = z.object({
  domain: interpretabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InterpretabilityAdminRecord = z.infer<typeof interpretabilityAdminRecordSchema>

export const interpretabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interpretabilityPercent: z.number().min(0).max(100),
})
export type InterpretabilityAdminStats = z.infer<typeof interpretabilityAdminStatsSchema>

export const interpretabilityAdminActionSchema = z.enum(['refresh_interpretability_summary'])
export type InterpretabilityAdminAction = z.infer<typeof interpretabilityAdminActionSchema>

export const interpretabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interpretabilityAdminRecordSchema),
  stats: interpretabilityAdminStatsSchema,
  availableActions: z.array(interpretabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InterpretabilityAdminSummaryResponse = z.infer<
  typeof interpretabilityAdminSummaryResponseSchema
>

export const interpretabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interpretabilityAdminActionSchema,
})
export type InterpretabilityAdminActionRequest = z.infer<
  typeof interpretabilityAdminActionRequestSchema
>

export const interpretabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interpretabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interpretabilityAdminStatsSchema.optional(),
})
export type InterpretabilityAdminActionResponse = z.infer<
  typeof interpretabilityAdminActionResponseSchema
>
