import { describe, expect, it } from 'vitest'
import { evaluateRunHistoryRollout } from './run-history-rollout.helpers.js'

describe('evaluateRunHistoryRollout', () => {
  it('passes in test mode with in-memory persistence', () => {
    const rollout = evaluateRunHistoryRollout({
      nodeEnv: 'test',
      usesInMemoryRepository: true,
      supportsMarkdownExport: true,
      supportsStreamReplay: false,
      supportedArtifactTypes: ['idea_brief', 'master_prompt', 'todo_list'],
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails in production with in-memory persistence', () => {
    const rollout = evaluateRunHistoryRollout({
      nodeEnv: 'production',
      usesInMemoryRepository: true,
      supportsMarkdownExport: true,
      supportsStreamReplay: true,
      supportedArtifactTypes: ['idea_brief', 'master_prompt', 'todo_list'],
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails when artifact type coverage is incomplete', () => {
    const rollout = evaluateRunHistoryRollout({
      nodeEnv: 'test',
      usesInMemoryRepository: true,
      supportsMarkdownExport: true,
      supportsStreamReplay: false,
      supportedArtifactTypes: ['idea_brief'],
    })

    expect(
      rollout.checks.find((check) => check.name === 'artifact_type_coverage')
        ?.status,
    ).toBe('fail')
  })
})
