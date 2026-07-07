import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UsageAdminPanel } from './UsageAdminPanel.js'

describe('UsageAdminPanel', () => {
  it('renders usage stats and actions', () => {
    const html = renderToStaticMarkup(
      <UsageAdminPanel
        summary={{
          role: 'owner',
          guidance: 'Review usage.',
          stats: {
            dailyEventCount: 12,
            distinctRunCount: 3,
            tokenUtilizationPercent: 45,
            costUtilizationPercent: 20,
          },
          usage: {
            dailyUsage: {
              totalTokens: 1200,
              estimatedCostUsd: 1.5,
            },
          },
          availableActions: ['reset_usage'],
        }}
        billingAction="idle"
        usageAdminAction="idle"
        billingAdminAction="idle"
        formatAction={(action) => action}
        onAction={() => undefined}
      />,
    )

    expect(html).toContain('Usage admin tools')
    expect(html).toContain('12')
    expect(html).toContain('reset_usage')
  })
})
