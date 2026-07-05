import type { ApiEnv } from '../config/env.js'

export const CRITICAL_DEFENSIBILITY_TABLES = [
  'shield_scans',
  'artifacts',
  'moderator_syntheses',
] as const

export type DefensibilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DefensibilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DefensibilityRolloutCheck[]
  guidance: string
}

export type DefensibilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingDefensibilityTableCount: number
  shieldScansTableExists: boolean
  artifactsTableExists: boolean
  moderatorSynthesesTableExists: boolean
}

export function evaluateDefensibilityRollout(
  input: DefensibilityRolloutInput,
): DefensibilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const defensibilityTableCoverageComplete =
    input.existingDefensibilityTableCount === CRITICAL_DEFENSIBILITY_TABLES.length

  const checks: DefensibilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL defensibility checks can reach the database.'
            : 'Production defensibility rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'defensibility_signal_table_coverage',
      label: 'Defensibility signal table coverage',
      status: defensibilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Defensibility signal table coverage is only enforced in production.'
          : defensibilityTableCoverageComplete
            ? `${input.existingDefensibilityTableCount}/${CRITICAL_DEFENSIBILITY_TABLES.length} defensibility signal tables are present.`
            : `${input.existingDefensibilityTableCount}/${CRITICAL_DEFENSIBILITY_TABLES.length} defensibility signal tables were found.`,
    },
    {
      name: 'shield_review_defensibility',
      label: 'Shield review defensibility',
      status: input.shieldScansTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Shield review defensibility is only enforced in production.'
          : input.shieldScansTableExists
            ? 'shield_scans table is available for shield review defensibility signals.'
            : 'Production defensibility rollout requires a shield_scans table.',
    },
    {
      name: 'artifact_defensibility',
      label: 'Artifact defensibility',
      status: input.artifactsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Artifact defensibility is only enforced in production.'
          : input.artifactsTableExists
            ? 'artifacts table is available for artifact defensibility signals.'
            : 'Production defensibility rollout requires a artifacts table.',
    },
    {
      name: 'justification_readiness_signal',
      label: 'Justification readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          defensibilityTableCoverageComplete &&
          input.shieldScansTableExists &&
          input.artifactsTableExists &&
          input.moderatorSynthesesTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Justification readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              defensibilityTableCoverageComplete &&
              input.shieldScansTableExists &&
              input.artifactsTableExists &&
              input.moderatorSynthesesTableExists
            ? 'Shield reviews, persisted artifacts, and moderator syntheses support justification readiness.'
            : 'Production defensibility rollout requires PostgreSQL connectivity, defensibility tables, shield review defensibility, artifact defensibility, and full signal coverage.',
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
        ? 'Production defensibility rollout checks passed. Defensibility coverage and justification readiness signal signals are healthy.'
        : 'Production defensibility rollout is not ready. Resolve failed checks before relying on production defensibility tooling.',
  }
}
