import type { ApiEnv } from '../config/env.js'
import type { TemporalRolloutStatus } from '@ai-war-room/schemas'

export type TemporalRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type TemporalRolloutEvaluation = {
  status: TemporalRolloutStatus
  checks: TemporalRolloutCheck[]
  guidance: string
}

export type TemporalRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  temporalEnabled: boolean
  temporalAddress: string
  temporalNamespace: string
  temporalTaskQueue: string
  workflowStreamPollMs: number
  workflowStreamTimeoutMs: number
  serverReachable?: boolean
  workerPolling?: boolean
}

function isLocalTemporalAddress(address: string) {
  return (
    address.includes('127.0.0.1') ||
    address.includes('localhost') ||
    address.startsWith('0.0.0.0')
  )
}

export function evaluateTemporalRollout(
  input: TemporalRolloutInput,
): TemporalRolloutEvaluation {
  if (!input.temporalEnabled) {
    return {
      status: 'disabled',
      checks: [
        {
          name: 'temporal_enabled',
          label: 'Temporal enabled',
          status: 'skip',
          detail:
            'Temporal is disabled. Set TEMPORAL_ENABLED=true to activate durable workflow rollout.',
        },
      ],
      guidance:
        'Temporal rollout is disabled. Enable Temporal before deploying durable workflow execution.',
    }
  }

  const isProduction = input.nodeEnv === 'production'
  const checks: TemporalRolloutCheck[] = [
    {
      name: 'temporal_enabled',
      label: 'Temporal enabled',
      status: 'pass',
      detail: 'Temporal durable workflows are enabled.',
    },
    {
      name: 'production_address',
      label: 'Production Temporal address',
      status:
        !isProduction || !isLocalTemporalAddress(input.temporalAddress)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction || !isLocalTemporalAddress(input.temporalAddress)
          ? `Temporal address is ${input.temporalAddress}.`
          : 'Production Temporal rollout requires a non-local TEMPORAL_ADDRESS.',
    },
    {
      name: 'temporal_namespace',
      label: 'Temporal namespace',
      status: input.temporalNamespace.trim().length > 0 ? 'pass' : 'fail',
      detail: `Temporal namespace is ${input.temporalNamespace}.`,
    },
    {
      name: 'temporal_task_queue',
      label: 'Temporal task queue',
      status: input.temporalTaskQueue.trim().length > 0 ? 'pass' : 'fail',
      detail: `Temporal task queue is ${input.temporalTaskQueue}.`,
    },
    {
      name: 'workflow_stream_poll_ms',
      label: 'Workflow stream poll interval',
      status:
        input.workflowStreamPollMs >= 100 &&
        input.workflowStreamPollMs <= 60_000
          ? 'pass'
          : 'fail',
      detail: `Workflow stream poll interval is ${input.workflowStreamPollMs}ms.`,
    },
    {
      name: 'workflow_stream_timeout_ms',
      label: 'Workflow stream timeout',
      status:
        input.workflowStreamTimeoutMs >= input.workflowStreamPollMs &&
        input.workflowStreamTimeoutMs <= 3_600_000
          ? 'pass'
          : 'fail',
      detail: `Workflow stream timeout is ${input.workflowStreamTimeoutMs}ms.`,
    },
  ]

  if (input.serverReachable !== undefined) {
    checks.push({
      name: 'temporal_server_reachable',
      label: 'Temporal server reachable',
      status: input.serverReachable ? 'pass' : 'fail',
      detail: input.serverReachable
        ? 'Temporal server responded to a health probe.'
        : 'Temporal server is unreachable at the configured TEMPORAL_ADDRESS.',
    })
  }

  if (input.workerPolling !== undefined) {
    checks.push({
      name: 'temporal_worker_polling',
      label: 'Temporal worker heartbeat',
      status: input.workerPolling ? 'pass' : 'fail',
      detail: input.workerPolling
        ? 'A recent worker heartbeat was detected for the configured task queue.'
        : 'No recent worker heartbeat was detected. Start the Temporal worker process.',
    })
  }

  const requiredChecks = checks.filter((check) => check.status !== 'skip')
  const status = requiredChecks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Temporal rollout checks passed. Durable workflow server, worker, and stream config are ready for production.'
        : 'Temporal rollout is not ready. Resolve failed checks before enabling durable workflows in production.',
  }
}
