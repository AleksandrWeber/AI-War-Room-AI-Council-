import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BillingWorkspacePanel } from './BillingWorkspacePanel.js'

describe('BillingWorkspacePanel', () => {
  it('renders overview mode with workspace and tier cards', () => {
    const html = renderToStaticMarkup(
      <BillingWorkspacePanel
        mode="overview"
        workspaceId="local_workspace"
        capabilities={{
          enabled: true,
          adapter: 'mock',
          guidance: 'Mock billing is enabled for local development.',
          checkoutTiers: ['pro', 'business'],
          supportsCheckout: true,
          supportsCustomerPortal: false,
          supportsUsageSummary: false,
          supportsBillingRollout: false,
          supportsBillingAlerts: false,
          supportsBillingAdminTools: false,
          supportsBillingNotifications: false,
          supportsMeteredUsage: false,
          supportsWebhookAudit: false,
          supportsInvoiceHistory: false,
          supportsBillingExport: false,
        }}
        rollout={null}
        status={null}
        alerts={[]}
        usageSummary={null}
        mockCustomerPortal={null}
        billingAction="idle"
        billingMessage={null}
        billingError={null}
        onRefreshStatus={() => undefined}
        onOpenCustomerPortal={() => undefined}
        onUpgradeTier={() => undefined}
        onCloseMockPortal={() => undefined}
        onCancelMockSubscription={() => undefined}
      />,
    )

    expect(html).toContain('local_workspace')
    expect(html).toContain('billing-grid')
    expect(html).toContain('Upgrade to Pro')
  })

  it('renders details mode invoice history section', () => {
    const html = renderToStaticMarkup(
      <BillingWorkspacePanel
        mode="details"
        workspaceId="local_workspace"
        capabilities={{
          enabled: true,
          adapter: 'mock',
          guidance: 'Mock billing is enabled for local development.',
          checkoutTiers: [],
          supportsCheckout: false,
          supportsCustomerPortal: false,
          supportsUsageSummary: false,
          supportsBillingRollout: false,
          supportsBillingAlerts: false,
          supportsBillingAdminTools: false,
          supportsBillingNotifications: false,
          supportsMeteredUsage: false,
          supportsWebhookAudit: false,
          supportsInvoiceHistory: true,
          supportsBillingExport: true,
        }}
        billingAction="idle"
        meterUsageReports={[]}
        notifications={[]}
        adminSummary={null}
        billingAdminAction="idle"
        webhookEvents={[]}
        invoices={[]}
        onBillingAdminAction={() => undefined}
        onExportInvoices={() => undefined}
      />,
    )

    expect(html).toContain('Invoice history')
    expect(html).toContain('Export CSV')
  })
})
