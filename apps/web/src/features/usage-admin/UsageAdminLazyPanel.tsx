import { UsageAdminPanel } from '@ai-war-room/web-blocks'
import { formatUsageAdminAction } from '../../usage-ui'

export type UsageAdminLazyPanelProps = {
  summary: {
    role: string
    guidance: string
    stats: {
      dailyEventCount: number
      distinctRunCount: number
      tokenUtilizationPercent: number
      costUtilizationPercent: number
    }
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
  onAction: (action: string) => void
}

export default function UsageAdminLazyPanel({
  summary,
  billingAction,
  usageAdminAction,
  billingAdminAction,
  onAction,
}: UsageAdminLazyPanelProps) {
  return (
    <UsageAdminPanel
      summary={summary}
      billingAction={billingAction}
      usageAdminAction={usageAdminAction}
      billingAdminAction={billingAdminAction}
      formatAction={formatUsageAdminAction as (action: string) => string}
      onAction={onAction}
    />
  )
}
