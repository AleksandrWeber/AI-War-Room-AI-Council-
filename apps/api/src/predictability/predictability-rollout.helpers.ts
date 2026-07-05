import type { ApiEnv } from '../config/env.js'

export const CRITICAL_PREDICTABILITY_TABLES = [
  'moderator_syntheses',
  'agent_outputs',
  'billing_invoices',
] as const

export type PredictabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PredictabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PredictabilityRolloutCheck[]
  guidance: string
}

export type PredictabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingPredictabilityTableCount: number
  moderatorSynthesesTableExists: boolean
  agentOutputsTableExists: boolean
  billingInvoicesTableExists: boolean
}

export function evaluatePredictabilityRollout(
  input: PredictabilityRolloutInput,
): PredictabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const predictabilityTableCoverageComplete =
    input.existingPredictabilityTableCount === CRITICAL_PREDICTABILITY_TABLES.length

  const checks: PredictabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL predictability checks can reach the database.'
            : 'Production predictability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'predictability_signal_table_coverage',
      label: 'Predictability signal table coverage',
      status: predictabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Predictability signal table coverage is only enforced in production.'
          : predictabilityTableCoverageComplete
            ? `${input.existingPredictabilityTableCount}/${CRITICAL_PREDICTABILITY_TABLES.length} predictability signal tables are present.`
            : `${input.existingPredictabilityTableCount}/${CRITICAL_PREDICTABILITY_TABLES.length} predictability signal tables were found.`,
    },
    {
      name: 'synthesis_predictability',
      label: 'Synthesis predictability',
      status: input.moderatorSynthesesTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Synthesis predictability is only enforced in production.'
          : input.moderatorSynthesesTableExists
            ? 'moderator_syntheses table is available for synthesis predictability signals.'
            : 'Production predictability rollout requires a moderator_syntheses table.',
    },
    {
      name: 'agent_output_predictability',
      label: 'Agent output predictability',
      status: input.agentOutputsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Agent output predictability is only enforced in production.'
          : input.agentOutputsTableExists
            ? 'agent_outputs table is available for agent output predictability signals.'
            : 'Production predictability rollout requires a agent_outputs table.',
    },
    {
      name: 'prediction_readiness_signal',
      label: 'Prediction readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          predictabilityTableCoverageComplete &&
          input.moderatorSynthesesTableExists &&
          input.agentOutputsTableExists &&
          input.billingInvoicesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Prediction readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              predictabilityTableCoverageComplete &&
              input.moderatorSynthesesTableExists &&
              input.agentOutputsTableExists &&
              input.billingInvoicesTableExists
            ? 'Moderator syntheses, agent outputs, and billing invoices support prediction readiness.'
            : 'Production predictability rollout requires PostgreSQL connectivity, predictability tables, synthesis predictability, agent output predictability, and full signal coverage.',
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
        ? 'Production predictability rollout checks passed. Predictability coverage and prediction readiness signal signals are healthy.'
        : 'Production predictability rollout is not ready. Resolve failed checks before relying on production predictability tooling.',
  }
}
