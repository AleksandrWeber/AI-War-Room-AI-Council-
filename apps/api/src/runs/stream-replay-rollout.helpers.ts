import { criticalStreamReplayEventTypes } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type StreamReplayRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type StreamReplayRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: StreamReplayRolloutCheck[]
  guidance: string
}

export type StreamReplayRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  usesRedisBackedBuffer: boolean
  redisConnectivity: boolean
  supportsReplayAfter: boolean
  supportsReplayAll: boolean
  streamBufferMaxLength: number
  supportedStreamEventTypes: readonly string[]
}

export function evaluateStreamReplayRollout(
  input: StreamReplayRolloutInput,
): StreamReplayRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const missingEventTypes = criticalStreamReplayEventTypes.filter(
    (eventType) => !input.supportedStreamEventTypes.includes(eventType),
  )

  const checks: StreamReplayRolloutCheck[] = [
    {
      name: 'redis_backed_buffer',
      label: 'Redis-backed stream buffer',
      status: input.usesRedisBackedBuffer || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Redis-backed stream buffer is only enforced in production.'
          : input.usesRedisBackedBuffer
            ? 'SSE stream events are buffered in Redis Streams.'
            : 'Production stream replay rollout requires a Redis-backed buffer.',
    },
    {
      name: 'redis_connectivity',
      label: 'Redis connectivity',
      status:
        !input.usesRedisBackedBuffer || input.redisConnectivity || !isProduction
          ? 'pass'
          : 'fail',
      detail:
        !input.usesRedisBackedBuffer
          ? 'Redis connectivity is validated when a Redis-backed buffer is enabled.'
          : input.redisConnectivity
            ? 'Redis stream buffer connectivity check passed.'
            : 'Production stream replay rollout requires reachable Redis connectivity.',
    },
    {
      name: 'replay_after_support',
      label: 'Last-Event-ID replay',
      status: input.supportsReplayAfter ? 'pass' : 'fail',
      detail: input.supportsReplayAfter
        ? 'Clients can resume SSE streams with Last-Event-ID replay.'
        : 'Last-Event-ID replay is not configured.',
    },
    {
      name: 'replay_all_support',
      label: 'Full stream replay',
      status: input.supportsReplayAll ? 'pass' : 'fail',
      detail: input.supportsReplayAll
        ? 'Buffered stream events can be replayed from the beginning.'
        : 'Full stream replay is not configured.',
    },
    {
      name: 'critical_event_type_coverage',
      label: 'Critical event type coverage',
      status: missingEventTypes.length === 0 ? 'pass' : 'fail',
      detail:
        missingEventTypes.length === 0
          ? `Stream replay supports ${criticalStreamReplayEventTypes.length} critical event types.`
          : `Missing stream event types: ${missingEventTypes.join(', ')}.`,
    },
    {
      name: 'production_buffer_capacity',
      label: 'Production buffer capacity',
      status:
        !isProduction || input.streamBufferMaxLength >= 100 ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Production buffer capacity is only enforced in production.'
          : input.streamBufferMaxLength >= 100
            ? `Stream buffer retains up to ${input.streamBufferMaxLength} events per run.`
            : 'Production stream replay rollout requires a buffer capacity of at least 100 events.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Stream replay rollout checks passed. SSE buffers and Last-Event-ID replay are ready for production.'
        : 'Stream replay rollout is not ready. Resolve failed checks before relying on production stream recovery tooling.',
  }
}
