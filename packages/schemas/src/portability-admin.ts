import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const portabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'agent_outputs',
])
export type PortabilityAdminDomain = z.infer<typeof portabilityAdminDomainSchema>

export const portabilityAdminRecordSchema = z.object({
  domain: portabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PortabilityAdminRecord = z.infer<typeof portabilityAdminRecordSchema>

export const portabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  portabilityPercent: z.number().min(0).max(100),
})
export type PortabilityAdminStats = z.infer<typeof portabilityAdminStatsSchema>

export const portabilityAdminActionSchema = z.enum(['refresh_portability_summary'])
export type PortabilityAdminAction = z.infer<typeof portabilityAdminActionSchema>

export const portabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(portabilityAdminRecordSchema),
  stats: portabilityAdminStatsSchema,
  availableActions: z.array(portabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PortabilityAdminSummaryResponse = z.infer<
  typeof portabilityAdminSummaryResponseSchema
>

export const portabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: portabilityAdminActionSchema,
})
export type PortabilityAdminActionRequest = z.infer<
  typeof portabilityAdminActionRequestSchema
>

export const portabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: portabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: portabilityAdminStatsSchema.optional(),
})
export type PortabilityAdminActionResponse = z.infer<
  typeof portabilityAdminActionResponseSchema
>
