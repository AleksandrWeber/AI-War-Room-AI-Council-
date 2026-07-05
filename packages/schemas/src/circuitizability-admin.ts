import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const circuitizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CircuitizabilityAdminDomain = z.infer<typeof circuitizabilityAdminDomainSchema>

export const circuitizabilityAdminRecordSchema = z.object({
  domain: circuitizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CircuitizabilityAdminRecord = z.infer<typeof circuitizabilityAdminRecordSchema>

export const circuitizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  circuitizabilityPercent: z.number().min(0).max(100),
})
export type CircuitizabilityAdminStats = z.infer<typeof circuitizabilityAdminStatsSchema>

export const circuitizabilityAdminActionSchema = z.enum(['refresh_circuitizability_summary'])
export type CircuitizabilityAdminAction = z.infer<typeof circuitizabilityAdminActionSchema>

export const circuitizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(circuitizabilityAdminRecordSchema),
  stats: circuitizabilityAdminStatsSchema,
  availableActions: z.array(circuitizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CircuitizabilityAdminSummaryResponse = z.infer<
  typeof circuitizabilityAdminSummaryResponseSchema
>

export const circuitizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: circuitizabilityAdminActionSchema,
})
export type CircuitizabilityAdminActionRequest = z.infer<
  typeof circuitizabilityAdminActionRequestSchema
>

export const circuitizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: circuitizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: circuitizabilityAdminStatsSchema.optional(),
})
export type CircuitizabilityAdminActionResponse = z.infer<
  typeof circuitizabilityAdminActionResponseSchema
>
