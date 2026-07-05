import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const streamReplayRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StreamReplayRolloutCheckStatus = z.infer<
  typeof streamReplayRolloutCheckStatusSchema
>

export const streamReplayRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: streamReplayRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StreamReplayRolloutCheck = z.infer<
  typeof streamReplayRolloutCheckSchema
>

export const streamReplayRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StreamReplayRolloutStatus = z.infer<
  typeof streamReplayRolloutStatusSchema
>

export const streamReplayEventTypeSchema = z.enum([
  'status',
  'artifact',
  'completed',
  'error',
  'workflow_status',
])
export type StreamReplayEventType = z.infer<typeof streamReplayEventTypeSchema>

export const streamReplayCapabilitiesResponseSchema = z.object({
  supportsStreamReplayRollout: z.literal(true),
  supportsStreamRecoveryAdminTools: z.literal(true),
  supportsLastEventIdReplay: z.literal(true),
  streamBufferMaxLength: z.number().int().positive(),
  supportedStreamEventTypes: z.array(streamReplayEventTypeSchema),
  guidance: nonEmptyStringSchema,
})
export type StreamReplayCapabilitiesResponse = z.infer<
  typeof streamReplayCapabilitiesResponseSchema
>

export const streamReplayRolloutResponseSchema = z.object({
  status: streamReplayRolloutStatusSchema,
  checks: z.array(streamReplayRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StreamReplayRolloutResponse = z.infer<
  typeof streamReplayRolloutResponseSchema
>

export const criticalStreamReplayEventTypes = [
  'status',
  'artifact',
  'completed',
  'error',
  'workflow_status',
] as const

export function getStreamReplayRolloutGuidance() {
  return 'Stream replay rollout validates Redis-backed SSE buffers, Last-Event-ID replay, and critical stream event coverage before production stream recovery tooling.'
}
