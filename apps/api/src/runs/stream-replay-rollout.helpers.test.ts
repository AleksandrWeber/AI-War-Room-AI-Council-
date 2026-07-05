import { describe, expect, it } from 'vitest'
import { evaluateStreamReplayRollout } from './stream-replay-rollout.helpers.js'

describe('evaluateStreamReplayRollout', () => {
  it('passes in test mode without redis-backed buffer', () => {
    const rollout = evaluateStreamReplayRollout({
      nodeEnv: 'test',
      usesRedisBackedBuffer: false,
      redisConnectivity: false,
      supportsReplayAfter: true,
      supportsReplayAll: true,
      streamBufferMaxLength: 100,
      supportedStreamEventTypes: [
        'status',
        'artifact',
        'completed',
        'error',
        'workflow_status',
      ],
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production without redis-backed buffer', () => {
    const rollout = evaluateStreamReplayRollout({
      nodeEnv: 'production',
      usesRedisBackedBuffer: false,
      redisConnectivity: true,
      supportsReplayAfter: true,
      supportsReplayAll: true,
      streamBufferMaxLength: 100,
      supportedStreamEventTypes: [
        'status',
        'artifact',
        'completed',
        'error',
        'workflow_status',
      ],
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when critical event type coverage is incomplete', () => {
    const rollout = evaluateStreamReplayRollout({
      nodeEnv: 'test',
      usesRedisBackedBuffer: false,
      redisConnectivity: true,
      supportsReplayAfter: true,
      supportsReplayAll: true,
      streamBufferMaxLength: 100,
      supportedStreamEventTypes: ['status'],
    })

    expect(
      rollout.checks.find((check) => check.name === 'critical_event_type_coverage')
        ?.status,
    ).toBe('fail')
  })
})
