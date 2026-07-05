import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'
import { streamReplayEventTypeSchema } from './stream-replay-rollout.js'

export const streamRecoveryAdminRecordSchema = z.object({
  runId: nonEmptyStringSchema,
  eventCount: z.number().int().nonnegative(),
  lastEventType: z.union([streamReplayEventTypeSchema, z.literal('unknown')]),
  lastEventId: nonEmptyStringSchema.optional(),
  lastEventAt: utcDateStringSchema.optional(),
  terminal: z.boolean(),
})
export type StreamRecoveryAdminRecord = z.infer<
  typeof streamRecoveryAdminRecordSchema
>

export const streamRecoveryAdminStatsSchema = z.object({
  bufferedRunCount: z.number().int().nonnegative(),
  totalBufferedEvents: z.number().int().nonnegative(),
  terminalRunCount: z.number().int().nonnegative(),
  activeRunCount: z.number().int().nonnegative(),
  replayReadyRunCount: z.number().int().nonnegative(),
})
export type StreamRecoveryAdminStats = z.infer<
  typeof streamRecoveryAdminStatsSchema
>

export const streamRecoveryAdminActionSchema = z.enum([
  'refresh_stream_recovery_summary',
  'clear_workspace_stream_buffers',
])
export type StreamRecoveryAdminAction = z.infer<
  typeof streamRecoveryAdminActionSchema
>

export const streamRecoveryAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  bufferedRuns: z.array(streamRecoveryAdminRecordSchema),
  stats: streamRecoveryAdminStatsSchema,
  availableActions: z.array(streamRecoveryAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StreamRecoveryAdminSummaryResponse = z.infer<
  typeof streamRecoveryAdminSummaryResponseSchema
>

export const streamRecoveryAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: streamRecoveryAdminActionSchema,
})
export type StreamRecoveryAdminActionRequest = z.infer<
  typeof streamRecoveryAdminActionRequestSchema
>

export const streamRecoveryAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: streamRecoveryAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: streamRecoveryAdminStatsSchema.optional(),
})
export type StreamRecoveryAdminActionResponse = z.infer<
  typeof streamRecoveryAdminActionResponseSchema
>
