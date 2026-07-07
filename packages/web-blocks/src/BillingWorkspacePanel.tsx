import type {
  BillingAdminSummaryResponse,
  BillingCapabilitiesResponse,
  BillingInvoiceRecord,
  BillingMeterUsageReport,
  BillingNotificationRecord,
  BillingRolloutResponse,
  BillingWebhookEventRecord,
  BillingWorkspaceAlertsResponse,
  BillingWorkspaceStatusResponse,
  BillingWorkspaceUsageResponse,
  CheckoutPaidTier,
  MockCustomerPortalResponse,
} from '@ai-war-room/schemas'
import {
  canOpenCustomerPortal,
  describeBillingCapabilities,
  formatBillingAdminAction,
  formatBillingAlertSeverity,
  formatBillingNotificationStatus,
  formatBillingRolloutCheckStatus,
  formatBillingRolloutStatus,
  formatBillingStatus,
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatMeterUsageReportStatus,
  formatPaidTier,
  formatTierLimits,
  formatUsageCostLabel,
  formatUsageMeterLabel,
  formatUsagePercent,
} from './billing.js'

export type BillingActionState =
  | 'idle'
  | 'loading'
  | 'upgrading'
  | 'portal'
  | 'canceling'

type BillingWorkspacePanelBaseProps = {
  workspaceId: string
  capabilities: BillingCapabilitiesResponse | null
  billingAction: BillingActionState
}

export type BillingWorkspaceOverviewProps = BillingWorkspacePanelBaseProps & {
  mode: 'overview'
  rollout: BillingRolloutResponse | null
  status: BillingWorkspaceStatusResponse | null
  alerts: BillingWorkspaceAlertsResponse['alerts']
  usageSummary: BillingWorkspaceUsageResponse | null
  mockCustomerPortal: MockCustomerPortalResponse | null
  billingMessage: string | null
  billingError: string | null
  onRefreshStatus: () => void
  onOpenCustomerPortal: () => void
  onUpgradeTier: (tier: CheckoutPaidTier) => void
  onCloseMockPortal: () => void
  onCancelMockSubscription: () => void
}

export type BillingWorkspaceDetailsProps = BillingWorkspacePanelBaseProps & {
  mode: 'details'
  meterUsageReports: BillingMeterUsageReport[]
  notifications: BillingNotificationRecord[]
  adminSummary: BillingAdminSummaryResponse | null
  billingAdminAction: 'idle' | 'running'
  webhookEvents: BillingWebhookEventRecord[]
  invoices: BillingInvoiceRecord[]
  onBillingAdminAction: (
    action: 'sync_notifications' | 'reset_mock_billing',
  ) => void
  onExportInvoices: (format: 'csv' | 'json') => void
}

export type BillingWorkspacePanelProps =
  | BillingWorkspaceOverviewProps
  | BillingWorkspaceDetailsProps

function BillingOverviewPanel({
  workspaceId,
  capabilities,
  rollout,
  status,
  alerts,
  usageSummary,
  mockCustomerPortal,
  billingAction,
  billingMessage,
  billingError,
  onRefreshStatus,
  onOpenCustomerPortal,
  onUpgradeTier,
  onCloseMockPortal,
  onCancelMockSubscription,
}: Omit<BillingWorkspaceOverviewProps, 'mode'>) {
  return (
    <>
      {capabilities?.supportsBillingRollout && rollout ? (
        <div className="billing-rollout">
          <div className="billing-rollout__header">
            <span>Billing rollout readiness</span>
            <strong
              className={`billing-rollout__status billing-rollout__status--${rollout.status}`}
            >
              {formatBillingRolloutStatus(rollout.status)}
            </strong>
          </div>
          <p>{rollout.guidance}</p>
          <div className="billing-rollout__checks">
            {rollout.checks.map((check) => (
              <article
                className={`billing-rollout-check billing-rollout-check--${check.status}`}
                key={check.name}
              >
                <strong>{check.label}</strong>
                <span>{formatBillingRolloutCheckStatus(check.status)}</span>
                <p>{check.detail}</p>
              </article>
            ))}
          </div>
          <small>Checked at {rollout.checkedAt}</small>
        </div>
      ) : null}

      {capabilities?.supportsBillingAlerts && alerts.length ? (
        <div className="billing-alerts">
          <span>Billing alerts</span>
          {alerts.map((alert) => (
            <article
              className={`billing-alert-card billing-alert-card--${alert.severity}`}
              key={alert.billingAlertId}
            >
              <strong>{formatBillingAlertSeverity(alert.severity)}</strong>
              <p>{alert.message}</p>
              <small>{alert.type.replaceAll('_', ' ')}</small>
            </article>
          ))}
        </div>
      ) : null}

      <div className="billing-summary">
        <article className="billing-status-card">
          <span>Current workspace</span>
          <strong>{workspaceId}</strong>
          <p>
            Tier:{' '}
            {status?.billingRecord
              ? formatPaidTier(status.billingRecord.paidTier)
              : 'Unknown'}
          </p>
          <p>
            Status:{' '}
            {status?.billingRecord
              ? formatBillingStatus(status.billingRecord.status)
              : billingAction === 'loading'
                ? 'Loading...'
                : 'Unavailable'}
          </p>
          {status?.billingRecord?.externalCustomerId ? (
            <small>Customer: {status.billingRecord.externalCustomerId}</small>
          ) : null}
        </article>

        <article className="billing-guidance-card">
          <span>Billing mode</span>
          <strong>
            {capabilities?.enabled
              ? capabilities.adapter === 'mock'
                ? 'Mock checkout'
                : 'Stripe checkout'
              : 'Disabled'}
          </strong>
          <p>{describeBillingCapabilities(capabilities)}</p>
          <div className="billing-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={billingAction !== 'idle'}
              onClick={onRefreshStatus}
            >
              Refresh billing status
            </button>
            {canOpenCustomerPortal(
              capabilities,
              status?.billingRecord?.externalCustomerId,
            ) ? (
              <button
                type="button"
                disabled={billingAction !== 'idle'}
                onClick={onOpenCustomerPortal}
              >
                {billingAction === 'portal'
                  ? 'Opening portal...'
                  : 'Manage subscription'}
              </button>
            ) : null}
          </div>
        </article>
      </div>

      {mockCustomerPortal ? (
        <div className="billing-portal-card">
          <span>Mock customer portal</span>
          <strong>
            {formatPaidTier(mockCustomerPortal.paidTier)} ·{' '}
            {formatBillingStatus(mockCustomerPortal.status)}
          </strong>
          <p>
            Customer {mockCustomerPortal.externalCustomerId} can manage the
            workspace subscription here during local development.
          </p>
          <ul className="billing-portal-actions">
            {mockCustomerPortal.availableActions.includes(
              'update_payment_method',
            ) ? (
              <li>Update payment method (Stripe only in production)</li>
            ) : null}
            {mockCustomerPortal.availableActions.includes(
              'cancel_subscription',
            ) ? (
              <li>
                <button
                  className="danger-button"
                  type="button"
                  disabled={billingAction !== 'idle'}
                  onClick={onCancelMockSubscription}
                >
                  {billingAction === 'canceling'
                    ? 'Canceling...'
                    : 'Cancel subscription'}
                </button>
              </li>
            ) : null}
          </ul>
          <button
            className="secondary-button"
            type="button"
            onClick={onCloseMockPortal}
          >
            Close portal
          </button>
        </div>
      ) : null}

      {billingMessage ? (
        <div className="billing-alert billing-alert--success">
          <strong>{billingMessage}</strong>
        </div>
      ) : null}

      {billingError ? <p className="form-error">{billingError}</p> : null}

      <div className="billing-grid">
        {(['free', 'pro', 'business'] as const).map((tier) => {
          const currentTier = status?.billingRecord?.paidTier ?? 'free'
          const isCurrent = currentTier === tier
          const isUpgradeTarget =
            capabilities?.checkoutTiers.includes(tier as CheckoutPaidTier) ??
            false

          return (
            <article
              className={`billing-tier-card${isCurrent ? ' billing-tier-card--current' : ''}`}
              key={tier}
            >
              <span>{formatPaidTier(tier)}</span>
              <strong>{formatTierLimits(tier)}</strong>
              <p>
                {tier === 'free'
                  ? 'Default local tier with core planning flow.'
                  : tier === 'pro'
                    ? 'Unlocks Market Research and higher daily limits.'
                    : 'Highest limits for teams running frequent deep runs.'}
              </p>
              {isCurrent ? (
                <p className="billing-tier-badge">Current tier</p>
              ) : tier !== 'free' &&
                isUpgradeTarget &&
                capabilities?.supportsCheckout ? (
                <button
                  type="button"
                  disabled={billingAction === 'upgrading'}
                  onClick={() => onUpgradeTier(tier)}
                >
                  {billingAction === 'upgrading'
                    ? 'Starting checkout...'
                    : `Upgrade to ${formatPaidTier(tier)}`}
                </button>
              ) : (
                <p className="clear-copy">
                  {capabilities?.enabled
                    ? 'Checkout unavailable for this tier.'
                    : 'Enable STRIPE_ENABLED=true on the API to start checkout.'}
                </p>
              )}
            </article>
          )
        })}
      </div>

      {capabilities?.supportsUsageSummary && usageSummary ? (
        <div className="billing-usage-summary">
          <span>Daily usage</span>
          <p className="clear-copy">
            UTC period ending{' '}
            {new Date(usageSummary.usagePeriodEnd).toLocaleString()}
          </p>
          <div className="billing-usage-meters">
            <article className="billing-usage-meter">
              <div className="billing-usage-meter__header">
                <strong>Tokens</strong>
                <small>
                  {formatUsageMeterLabel(
                    usageSummary.dailyUsage.totalTokens,
                    usageSummary.dailyTokenLimit,
                    'tokens',
                  )}
                </small>
              </div>
              <div
                className="billing-usage-meter__track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={usageSummary.dailyTokenLimit}
                aria-valuenow={usageSummary.dailyUsage.totalTokens}
                aria-label="Daily token usage"
              >
                <div
                  className="billing-usage-meter__fill"
                  style={{
                    width: `${formatUsagePercent(
                      usageSummary.dailyUsage.totalTokens,
                      usageSummary.dailyTokenLimit,
                    )}%`,
                  }}
                />
              </div>
            </article>
            <article className="billing-usage-meter">
              <div className="billing-usage-meter__header">
                <strong>Estimated cost</strong>
                <small>
                  {formatUsageCostLabel(
                    usageSummary.dailyUsage.estimatedCostUsd,
                    usageSummary.dailyCostLimitUsd,
                  )}
                </small>
              </div>
              <div
                className="billing-usage-meter__track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={usageSummary.dailyCostLimitUsd}
                aria-valuenow={usageSummary.dailyUsage.estimatedCostUsd}
                aria-label="Daily estimated cost usage"
              >
                <div
                  className="billing-usage-meter__fill billing-usage-meter__fill--cost"
                  style={{
                    width: `${formatUsagePercent(
                      usageSummary.dailyUsage.estimatedCostUsd,
                      usageSummary.dailyCostLimitUsd,
                    )}%`,
                  }}
                />
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </>
  )
}

function BillingDetailsPanel({
  capabilities,
  meterUsageReports,
  notifications,
  adminSummary,
  billingAction,
  billingAdminAction,
  webhookEvents,
  invoices,
  onBillingAdminAction,
  onExportInvoices,
}: Omit<BillingWorkspaceDetailsProps, 'mode' | 'workspaceId'>) {
  return (
    <>
      {capabilities?.supportsMeteredUsage ? (
        <div className="billing-meter-usage">
          <span>Metered usage reports</span>
          {meterUsageReports.length ? (
            meterUsageReports.map((report) => (
              <article
                className="billing-meter-usage-card"
                key={report.billingMeterUsageReportId}
              >
                <strong>
                  {report.quantity.toLocaleString()} {report.metric}
                </strong>
                <p>{formatMeterUsageReportStatus(report.status)}</p>
                <small>
                  {report.runId ? `Run ${report.runId}` : 'Manual report'}
                  {report.externalUsageRecordId
                    ? ` · ${report.externalUsageRecordId}`
                    : ''}
                </small>
              </article>
            ))
          ) : (
            <p className="clear-copy">
              No metered usage reports recorded for this workspace yet.
            </p>
          )}
        </div>
      ) : null}

      {capabilities?.supportsBillingNotifications ? (
        <div className="billing-notifications">
          <span>Notification delivery</span>
          {notifications.length ? (
            notifications.map((notification) => (
              <article
                className={`billing-notification-card billing-notification-card--${notification.status}`}
                key={notification.billingNotificationId}
              >
                <strong>{formatBillingAlertSeverity(notification.severity)}</strong>
                <p>{notification.message}</p>
                <small>
                  {formatBillingNotificationStatus(notification.status)} ·{' '}
                  {notification.channel}
                  {notification.deliveryReference
                    ? ` · ${notification.deliveryReference}`
                    : ''}
                </small>
              </article>
            ))
          ) : (
            <p className="clear-copy">
              No billing notifications have been delivered for this workspace yet.
            </p>
          )}
        </div>
      ) : null}

      {capabilities?.supportsBillingAdminTools && adminSummary ? (
        <div className="billing-admin">
          <div className="billing-admin__header">
            <span>Billing admin tools</span>
            <strong>{adminSummary.role}</strong>
          </div>
          <p>{adminSummary.guidance}</p>
          <div className="billing-admin__stats">
            <article className="billing-admin-stat">
              <span>Alerts</span>
              <strong>{adminSummary.stats.alertCount}</strong>
              <small>{adminSummary.stats.criticalAlertCount} critical</small>
            </article>
            <article className="billing-admin-stat">
              <span>Invoices</span>
              <strong>{adminSummary.stats.invoiceCount}</strong>
              <small>
                ${adminSummary.stats.paidInvoiceTotalUsd.toFixed(2)} paid
              </small>
            </article>
            <article className="billing-admin-stat">
              <span>Webhooks</span>
              <strong>{adminSummary.stats.webhookEventCount}</strong>
              <small>{adminSummary.stats.failedWebhookEventCount} failed</small>
            </article>
            <article className="billing-admin-stat">
              <span>Notifications</span>
              <strong>{adminSummary.stats.notificationCount}</strong>
              <small>{adminSummary.stats.failedNotificationCount} failed</small>
            </article>
          </div>
          {adminSummary.availableActions.length ? (
            <div className="billing-admin__actions">
              {adminSummary.availableActions.map((action) => (
                <button
                  key={action}
                  className={
                    action === 'reset_mock_billing'
                      ? 'danger-button'
                      : 'secondary-button'
                  }
                  type="button"
                  disabled={
                    billingAction !== 'idle' || billingAdminAction !== 'idle'
                  }
                  onClick={() => onBillingAdminAction(action)}
                >
                  {formatBillingAdminAction(action)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {capabilities?.supportsWebhookAudit ? (
        <div className="billing-webhook-events">
          <span>Recent webhook events</span>
          {webhookEvents.length ? (
            webhookEvents.map((event) => (
              <article className="billing-webhook-event" key={event.billingWebhookEventId}>
                <strong>{event.eventType}</strong>
                <p>
                  {event.status} · {event.externalEventId}
                </p>
                <small>{new Date(event.receivedAt).toLocaleString()}</small>
              </article>
            ))
          ) : (
            <p className="clear-copy">
              No webhook events recorded for this workspace yet.
            </p>
          )}
        </div>
      ) : null}

      {capabilities?.supportsInvoiceHistory ? (
        <div className="billing-invoice-history">
          <div className="billing-invoice-history__header">
            <span>Invoice history</span>
            {capabilities.supportsBillingExport ? (
              <div className="billing-export-actions">
                <button
                  type="button"
                  onClick={() => onExportInvoices('csv')}
                  disabled={billingAction !== 'idle'}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => onExportInvoices('json')}
                  disabled={billingAction !== 'idle'}
                >
                  Export JSON
                </button>
              </div>
            ) : null}
          </div>
          {invoices.length ? (
            invoices.map((invoice) => (
              <article className="billing-invoice-card" key={invoice.billingInvoiceId}>
                <div>
                  <strong>
                    {formatInvoiceAmount(invoice.amountTotalUsd, invoice.currency)}
                  </strong>
                  <p>
                    {formatInvoiceStatus(invoice.status)}
                    {invoice.paidTier ? ` · ${formatPaidTier(invoice.paidTier)}` : ''}
                  </p>
                  <small>{invoice.externalInvoiceId}</small>
                </div>
                <div className="billing-invoice-meta">
                  <small>{new Date(invoice.createdAt).toLocaleString()}</small>
                  {invoice.hostedInvoiceUrl ? (
                    <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                      View invoice
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="clear-copy">No invoices recorded for this workspace yet.</p>
          )}
        </div>
      ) : null}
    </>
  )
}

export function BillingWorkspacePanel(props: BillingWorkspacePanelProps) {
  if (props.mode === 'overview') {
    const { mode: _mode, ...overviewProps } = props
    return <BillingOverviewPanel {...overviewProps} />
  }

  const { mode: _mode, workspaceId: _workspaceId, ...detailsProps } = props
  return <BillingDetailsPanel {...detailsProps} />
}
