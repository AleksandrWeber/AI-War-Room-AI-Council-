import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const idempotencyAdminRecordSchema = z.object({
  idempotencyKey: nonEmptyStringSchema,
  runId: nonEmptyStringSchema.optional(),
  expiresAt: utcDateStringSchema.optional(),
  reservationActive: z.boolean(),
  expired: z.boolean(),
})
export type IdempotencyAdminRecord = z.infer<typeof idempotencyAdminRecordSchema>

export const idempotencyAdminStatsSchema = z.object({
  totalKeys: z.number().int().nonnegative(),
  activeReservations: z.number().int().nonnegative(),
  expiredKeys: z.number().int().nonnegative(),
  linkedRunCount: z.number().int().nonnegative(),
})
export type IdempotencyAdminStats = z.infer<typeof idempotencyAdminStatsSchema>

export const idempotencyAdminActionSchema = z.enum([
  'refresh_idempotency_summary',
  'clear_workspace_idempotency_reservations',
])
export type IdempotencyAdminAction = z.infer<typeof idempotencyAdminActionSchema>

export const idempotencyAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(idempotencyAdminRecordSchema),
  stats: idempotencyAdminStatsSchema,
  availableActions: z.array(idempotencyAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IdempotencyAdminSummaryResponse = z.infer<
  typeof idempotencyAdminSummaryResponseSchema
>

export const idempotencyAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: idempotencyAdminActionSchema,
})
export type IdempotencyAdminActionRequest = z.infer<
  typeof idempotencyAdminActionRequestSchema
>

export const idempotencyAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: idempotencyAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: idempotencyAdminStatsSchema.optional(),
})
export type IdempotencyAdminActionResponse = z.infer<
  typeof idempotencyAdminActionResponseSchema
>

export type IdempotencyRecord = {
  idempotencyKey: string
  runId: string
  expiresAt: string
  expired: boolean
}
