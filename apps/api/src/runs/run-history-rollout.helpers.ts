import { criticalRunHistoryArtifactTypes } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type RunHistoryRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type RunHistoryRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: RunHistoryRolloutCheck[]
  guidance: string
}

export type RunHistoryRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  usesInMemoryRepository: boolean
  supportsMarkdownExport: boolean
  supportsStreamReplay: boolean
  supportedArtifactTypes: readonly string[]
}

export function evaluateRunHistoryRollout(
  input: RunHistoryRolloutInput,
): RunHistoryRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const missingArtifactTypes = criticalRunHistoryArtifactTypes.filter(
    (artifactType) => !input.supportedArtifactTypes.includes(artifactType),
  )

  const checks: RunHistoryRolloutCheck[] = [
    {
      name: 'artifact_history_persistence',
      label: 'Artifact history persistence',
      status: !input.usesInMemoryRepository || !isProduction ? 'pass' : 'fail',
      detail:
        !input.usesInMemoryRepository || !isProduction
          ? 'Artifact history uses durable persistence outside tests.'
          : 'Production run history rollout cannot rely on in-memory persistence.',
    },
    {
      name: 'markdown_export_support',
      label: 'Markdown export support',
      status: input.supportsMarkdownExport ? 'pass' : 'fail',
      detail: input.supportsMarkdownExport
        ? 'Markdown export is available for persisted artifacts.'
        : 'Markdown export is not configured.',
    },
    {
      name: 'stream_replay_buffer',
      label: 'Stream replay buffer',
      status: input.supportsStreamReplay || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Stream replay buffer is only enforced in production.'
          : input.supportsStreamReplay
            ? 'Stream replay buffer is configured for run history recovery.'
            : 'Production run history rollout requires Redis-backed stream replay.',
    },
    {
      name: 'artifact_type_coverage',
      label: 'Artifact type coverage',
      status: missingArtifactTypes.length === 0 ? 'pass' : 'fail',
      detail:
        missingArtifactTypes.length === 0
          ? `Run history supports ${criticalRunHistoryArtifactTypes.length} artifact types.`
          : `Missing artifact types: ${missingArtifactTypes.join(', ')}.`,
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
        ? 'Run history rollout checks passed. Artifact persistence and export tooling are ready for production.'
        : 'Run history rollout is not ready. Resolve failed checks before relying on production run history tooling.',
  }
}
