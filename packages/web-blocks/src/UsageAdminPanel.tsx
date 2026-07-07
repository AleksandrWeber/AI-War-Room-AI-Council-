import { BillingAdminPanel } from './BillingAdminPanel.js'

export type UsageAdminDailyStats = {
  dailyEventCount: number
  distinctRunCount: number
  tokenUtilizationPercent: number
  costUtilizationPercent: number
}

export type UsageAdminPanelProps = {
  summary: {
    role: string
    guidance: string
    stats: UsageAdminDailyStats
    usage: {
      dailyUsage: {
        totalTokens: number
        estimatedCostUsd: number
      }
    }
    availableActions: string[]
  }
  billingAction: string
  usageAdminAction: string
  billingAdminAction: string
  formatAction: (action: string) => string
  onAction: (action: string) => void
}

export function UsageAdminPanel({
  summary,
  billingAction,
  usageAdminAction,
  billingAdminAction,
  formatAction,
  onAction,
}: UsageAdminPanelProps) {
  return (
    <BillingAdminPanel
      title="Usage admin tools"
      role={summary.role}
      guidance={summary.guidance}
      stats={[
        {
          label: 'Daily events',
          value: summary.stats.dailyEventCount,
          detail: `${summary.stats.distinctRunCount} runs`,
        },
        {
          label: 'Token utilization',
          value: `${summary.stats.tokenUtilizationPercent}%`,
          detail: `${summary.usage.dailyUsage.totalTokens.toLocaleString()} tokens`,
        },
        {
          label: 'Cost utilization',
          value: `${summary.stats.costUtilizationPercent}%`,
          detail: `$${summary.usage.dailyUsage.estimatedCostUsd.toFixed(2)} used`,
        },
      ]}
    >
      {summary.availableActions.length ? (
        <div className="billing-admin__actions">
          {summary.availableActions.map((action) => (
            <button
              key={action}
              className="danger-button"
              type="button"
              disabled={
                billingAction !== 'idle' ||
                usageAdminAction !== 'idle' ||
                billingAdminAction !== 'idle'
              }
              onClick={() => onAction(action)}
            >
              {formatAction(action)}
            </button>
          ))}
        </div>
      ) : null}
    </BillingAdminPanel>
  )
}
