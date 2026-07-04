import type {
  BillingAlert,
  BillingRecord,
  BillingWorkspaceUsageResponse,
} from '@ai-war-room/schemas'

const USAGE_WARNING_THRESHOLD = 0.8

function formatPercent(ratio: number) {
  return `${Math.round(ratio * 100)}%`
}

function buildUsageTokenAlert(input: {
  workspaceId: string
  usage: BillingWorkspaceUsageResponse
  createdAt: string
}): BillingAlert | null {
  const ratio =
    input.usage.dailyUsage.totalTokens / input.usage.dailyTokenLimit

  if (ratio >= 1) {
    return {
      billingAlertId: `${input.workspaceId}:usage_tokens:critical`,
      workspaceId: input.workspaceId,
      type: 'usage_tokens',
      severity: 'critical',
      message:
        'Daily token usage reached the workspace limit. New runs may be blocked until the UTC period resets.',
      createdAt: input.createdAt,
    }
  }

  if (ratio >= USAGE_WARNING_THRESHOLD) {
    return {
      billingAlertId: `${input.workspaceId}:usage_tokens:warning`,
      workspaceId: input.workspaceId,
      type: 'usage_tokens',
      severity: 'warning',
      message: `Daily token usage is at ${formatPercent(ratio)} of the workspace limit.`,
      createdAt: input.createdAt,
    }
  }

  return null
}

function buildUsageCostAlert(input: {
  workspaceId: string
  usage: BillingWorkspaceUsageResponse
  createdAt: string
}): BillingAlert | null {
  const ratio =
    input.usage.dailyUsage.estimatedCostUsd / input.usage.dailyCostLimitUsd

  if (ratio >= 1) {
    return {
      billingAlertId: `${input.workspaceId}:usage_cost:critical`,
      workspaceId: input.workspaceId,
      type: 'usage_cost',
      severity: 'critical',
      message:
        'Estimated daily cost reached the workspace limit. New runs may be blocked until the UTC period resets.',
      createdAt: input.createdAt,
    }
  }

  if (ratio >= USAGE_WARNING_THRESHOLD) {
    return {
      billingAlertId: `${input.workspaceId}:usage_cost:warning`,
      workspaceId: input.workspaceId,
      type: 'usage_cost',
      severity: 'warning',
      message: `Estimated daily cost is at ${formatPercent(ratio)} of the workspace limit.`,
      createdAt: input.createdAt,
    }
  }

  return null
}

function buildBillingStatusAlerts(input: {
  workspaceId: string
  billingRecord: BillingRecord | null
  createdAt: string
}): BillingAlert[] {
  if (!input.billingRecord) {
    return []
  }

  if (input.billingRecord.status === 'past_due') {
    return [
      {
        billingAlertId: `${input.workspaceId}:billing_past_due`,
        workspaceId: input.workspaceId,
        type: 'billing_past_due',
        severity: 'critical',
        message:
          'Subscription payment is past due. Update billing in the customer portal to avoid service interruption.',
        createdAt: input.createdAt,
      },
    ]
  }

  if (input.billingRecord.status === 'canceled') {
    return [
      {
        billingAlertId: `${input.workspaceId}:billing_canceled`,
        workspaceId: input.workspaceId,
        type: 'billing_canceled',
        severity: 'warning',
        message:
          'Subscription is canceled. Workspace tier limits may be reduced to the free tier.',
        createdAt: input.createdAt,
      },
    ]
  }

  return []
}

export function buildWorkspaceBillingAlerts(input: {
  workspaceId: string
  usage: BillingWorkspaceUsageResponse
  billingRecord: BillingRecord | null
  createdAt?: string
}) {
  const createdAt = input.createdAt ?? new Date().toISOString()
  const alerts: BillingAlert[] = []

  const tokenAlert = buildUsageTokenAlert({
    workspaceId: input.workspaceId,
    usage: input.usage,
    createdAt,
  })

  if (tokenAlert) {
    alerts.push(tokenAlert)
  }

  const costAlert = buildUsageCostAlert({
    workspaceId: input.workspaceId,
    usage: input.usage,
    createdAt,
  })

  if (costAlert) {
    alerts.push(costAlert)
  }

  alerts.push(
    ...buildBillingStatusAlerts({
      workspaceId: input.workspaceId,
      billingRecord: input.billingRecord,
      createdAt,
    }),
  )

  const severityRank = {
    critical: 0,
    warning: 1,
    info: 2,
  } as const

  return alerts.sort(
    (left, right) => severityRank[left.severity] - severityRank[right.severity],
  )
}
