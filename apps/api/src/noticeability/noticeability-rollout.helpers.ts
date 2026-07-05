import type { ApiEnv } from '../config/env.js'

export const CRITICAL_NOTICEABILITY_TABLES = [
  'billing_notifications',
  'billing_webhook_events',
  'usage_events',
] as const

export type NoticeabilityRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type NoticeabilityRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: NoticeabilityRolloutCheck[]
  guidance: string
}

export type NoticeabilityRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  postgresConnectivity: boolean
  existingNoticeabilityTableCount: number
  billingNotificationsTableExists: boolean
  billingWebhookEventsTableExists: boolean
  usageEventsTableExists: boolean
}

export function evaluateNoticeabilityRollout(
  input: NoticeabilityRolloutInput,
): NoticeabilityRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const noticeabilityTableCoverageComplete =
    input.existingNoticeabilityTableCount === CRITICAL_NOTICEABILITY_TABLES.length

  const checks: NoticeabilityRolloutCheck[] = [
    {
      name: 'postgres_connectivity',
      label: 'PostgreSQL connectivity',
      status: input.postgresConnectivity || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'PostgreSQL connectivity is only enforced in production.'
          : input.postgresConnectivity
            ? 'PostgreSQL noticeability checks can reach the database.'
            : 'Production noticeability rollout requires reachable PostgreSQL connectivity.',
    },
    {
      name: 'noticeability_signal_table_coverage',
      label: 'Noticeability signal table coverage',
      status: noticeabilityTableCoverageComplete || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Noticeability signal table coverage is only enforced in production.'
          : noticeabilityTableCoverageComplete
            ? `${input.existingNoticeabilityTableCount}/${CRITICAL_NOTICEABILITY_TABLES.length} noticeability signal tables are present.`
            : `${input.existingNoticeabilityTableCount}/${CRITICAL_NOTICEABILITY_TABLES.length} noticeability signal tables were found.`,
    },
    {
      name: 'billing_notification_noticeability',
      label: 'Billing notification noticeability',
      status: input.billingNotificationsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing notification noticeability is only enforced in production.'
          : input.billingNotificationsTableExists
            ? 'billing_notifications table is available for billing notification noticeability signals.'
            : 'Production noticeability rollout requires a billing_notifications table.',
    },
    {
      name: 'billing_webhook_noticeability',
      label: 'Billing webhook noticeability',
      status: input.billingWebhookEventsTableExists || !isProduction ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Billing webhook noticeability is only enforced in production.'
          : input.billingWebhookEventsTableExists
            ? 'billing_webhook_events table is available for billing webhook noticeability signals.'
            : 'Production noticeability rollout requires a billing_webhook_events table.',
    },
    {
      name: 'notice_readiness_signal',
      label: 'Notice readiness signal',
      status:
        !isProduction ||
        (input.postgresConnectivity &&
          noticeabilityTableCoverageComplete &&
          input.billingNotificationsTableExists &&
          input.billingWebhookEventsTableExists &&
          input.usageEventsTableExists)
          ? 'pass'
          : 'fail',
      detail:
        !isProduction
          ? 'Notice readiness signal is only enforced in production.'
          : input.postgresConnectivity &&
              noticeabilityTableCoverageComplete &&
              input.billingNotificationsTableExists &&
              input.billingWebhookEventsTableExists &&
              input.usageEventsTableExists
            ? 'Billing notifications, billing webhook events, and usage events support notice readiness.'
            : 'Production noticeability rollout requires PostgreSQL connectivity, noticeability tables, billing notification noticeability, billing webhook noticeability, and full signal coverage.',
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
        ? 'Production noticeability rollout checks passed. Noticeability coverage and notice readiness signal signals are healthy.'
        : 'Production noticeability rollout is not ready. Resolve failed checks before relying on production noticeability tooling.',
  }
}
