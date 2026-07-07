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
    <div className="billing-admin">
      <div className="billing-admin__header">
        <span>Usage admin tools</span>
        <strong>{summary.role}</strong>
      </div>
      <p>{summary.guidance}</p>
      <div className="billing-admin__stats">
        <article className="billing-admin-stat">
          <span>Daily events</span>
          <strong>{summary.stats.dailyEventCount}</strong>
          <small>{summary.stats.distinctRunCount} runs</small>
        </article>
        <article className="billing-admin-stat">
          <span>Token utilization</span>
          <strong>{summary.stats.tokenUtilizationPercent}%</strong>
          <small>{summary.usage.dailyUsage.totalTokens.toLocaleString()} tokens</small>
        </article>
        <article className="billing-admin-stat">
          <span>Cost utilization</span>
          <strong>{summary.stats.costUtilizationPercent}%</strong>
          <small>${summary.usage.dailyUsage.estimatedCostUsd.toFixed(2)} used</small>
        </article>
      </div>
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
    </div>
  )
}
