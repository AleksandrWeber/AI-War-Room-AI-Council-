// @ts-nocheck
import { AdminExportActions, BillingAdminPanel } from '@ai-war-room/web-blocks'
import {
  formatDependencyName,
  formatDependencyStatus,
  formatDeploymentAdminAction,
} from '../../deployment-ui'
import {
  formatPromptRegressionAdminAction,
  formatPromptRegressionScore,
} from '../../evaluation-ui'
import {
  formatIdempotencyAdminAction,
} from '../../idempotency-ui'
import {
  formatMigrationAdminAction,
  formatMigrationStatus,
} from '../../migrations-ui'
import {
  formatModelHealthStatus,
  formatModelLifecycleStatus,
} from '../../model-router-ui'
import {
  formatObservabilityAdminAction,
  formatObservabilityEventLevel,
} from '../../observability-ui'
import {
  formatProviderKeyAdminAction,
  formatProviderKeyTestStatus,
} from '../../provider-credentials-ui'
import {
  formatArtifactType,
  formatRunHistoryAdminAction,
} from '../../run-history-ui'
import {
  formatFalsePositiveRate,
  formatShieldReviewAdminAction,
  formatShieldReviewStatus,
} from '../../shield-ui'
import {
  formatStreamEventType,
  formatStreamRecoveryAdminAction,
} from '../../stream-replay-ui'
import {
  formatQuotaAdminAction,
  formatUsagePhase,
} from '../../usage-limits-ui'

export type OperationsAdminBulkProps = Record<string, unknown>

export default function OperationsAdminBulk(props: OperationsAdminBulkProps) {
  return (
    <>
        {props.modelHealthAdminSummary ? (
          <BillingAdminPanel
            title="Model health admin"
            panelClassName="workspace-model-health-admin"
            role={props.modelHealthAdminSummary.role}
            guidance={props.modelHealthAdminSummary.guidance}
            stats={[
            {
              label: 'Active models',
              value: props.modelHealthAdminSummary.stats.activeModels,
              detail: <>{props.modelHealthAdminSummary.stats.totalModels} total in registry</>,
            },
            {
              label: 'Degraded models',
              value: props.modelHealthAdminSummary.stats.degradedModels,
              detail: <>{props.modelHealthAdminSummary.stats.candidateModels} candidates</>,
            }
            ]}
          >
<div className="workspace-model-health-list">
              {props.modelHealthAdminSummary.models.map((model) => (
                <article
                  className={`workspace-model-health-card workspace-model-health-card--${model.healthStatus}`}
                  key={model.modelId}
                >
                  <div>
                    <strong>{model.modelId}</strong>
                    <p>
                      {model.providerId} · {model.modelName}
                    </p>
                    <small>
                      {formatModelLifecycleStatus(model.lifecycleStatus)} ·{' '}
                      {formatModelHealthStatus(model.healthStatus)}
                      {model.consecutiveFailures
                        ? ` · ${model.consecutiveFailures} failures`
                        : ''}
                    </small>
                  </div>
                  {props.modelHealthAdminSummary.availableActions.includes(
                    'recover_model',
                  ) && model.healthStatus === 'degraded' ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={props.modelHealthAdminAction !== 'idle'}
                      onClick={() =>
                        void props.handleModelHealthAdminAction(model.modelId)
                      }
                    >
                      Recover model
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </BillingAdminPanel>
        ) : null}

        {props.shieldReviewAdminSummary ? (
          <BillingAdminPanel
            title="Shield review admin"
            panelClassName="workspace-shield-review-admin"
            role={props.shieldReviewAdminSummary.role}
            guidance={props.shieldReviewAdminSummary.guidance}
            stats={[
            {
              label: 'Review cases',
              value: props.shieldReviewAdminSummary.stats.totalCases,
              detail: <>{props.shieldReviewAdminSummary.stats.passedCases} passed</>,
            },
            {
              label: 'False positives',
              value: props.shieldReviewAdminSummary.stats.falsePositiveCount,
              detail: <>{formatFalsePositiveRate(
                    props.shieldReviewAdminSummary.stats.falsePositiveRate,
                  )}{' '}
                  rate</>,
            }
            ]}
          >
<p className="clear-copy">
              Classifier: {props.shieldReviewAdminSummary.classifierId}
            </p>
            <div className="workspace-shield-review-list">
              {props.shieldReviewAdminSummary.cases.map((reviewCase) => (
                <article
                  className={`workspace-shield-review-card workspace-shield-review-card--${reviewCase.passed ? 'pass' : 'fail'}`}
                  key={reviewCase.caseId}
                >
                  <div>
                    <strong>{reviewCase.caseId}</strong>
                    <p>
                      Expected {formatShieldReviewStatus(reviewCase.expectedStatus)} ·
                      Actual {formatShieldReviewStatus(reviewCase.actualStatus)}
                    </p>
                    <small>{reviewCase.passed ? 'Passed' : 'Failed'}</small>
                  </div>
                </article>
              ))}
            </div>
            {props.shieldReviewAdminSummary.availableActions.includes(
              'rerun_review_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.shieldReviewAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleShieldReviewAdminAction('rerun_review_summary')
                }
              >
                {formatShieldReviewAdminAction('rerun_review_summary')}
              </button>
            ) : null}
            {props.shieldReviewAdminSummary.availableActions.includes(
              'purge_expired_full_scans',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.shieldReviewAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleShieldReviewAdminAction(
                    'purge_expired_full_scans',
                  )
                }
              >
                {formatShieldReviewAdminAction('purge_expired_full_scans')}
              </button>
            ) : null}
            {props.shieldFalsePositiveReports ? (
              <>
                <p className="clear-copy">
                  User FP queue: {props.shieldFalsePositiveReports.openCount} open
                  / {props.shieldFalsePositiveReports.reports.length} total
                </p>
                <div className="workspace-shield-review-list">
                  {props.shieldFalsePositiveReports.reports
                    .slice(0, 8)
                    .map((report) => (
                      <article
                        className="workspace-shield-review-card"
                        key={report.reportId}
                      >
                        <div>
                          <strong>
                            {report.category} · {report.severity}
                          </strong>
                          <p>
                            Run {report.runId} · {report.status} ·{' '}
                            {report.actorUserId}
                          </p>
                          {report.note ? <small>{report.note}</small> : null}
                          {report.status === 'open' ? (
                            <div className="estimate-row">
                              <button
                                className="secondary-button"
                                type="button"
                                onClick={() =>
                                  void props.handleResolveFalsePositiveReport({
                                    reportId: report.reportId,
                                    decision: 'accepted',
                                  })
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="secondary-button"
                                type="button"
                                onClick={() =>
                                  void props.handleResolveFalsePositiveReport({
                                    reportId: report.reportId,
                                    decision: 'rejected',
                                  })
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : report.reviewedByUserId ? (
                            <small>
                              Reviewed by {report.reviewedByUserId}
                              {report.reviewNote
                                ? `: ${report.reviewNote}`
                                : ''}
                            </small>
                          ) : null}
                        </div>
                      </article>
                    ))}
                </div>
              </>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.providerKeyAdminSummary ? (
          <BillingAdminPanel
            title="Provider key admin"
            panelClassName="workspace-provider-key-admin"
            role={props.providerKeyAdminSummary.role}
            guidance={props.providerKeyAdminSummary.guidance}
            stats={[
            {
              label: 'Workspace keys',
              value: props.providerKeyAdminSummary.stats.totalCredentials,
              detail: <>{props.providerKeyAdminSummary.stats.passedCredentials} passed</>,
            },
            {
              label: 'Failed / untested',
              value: props.providerKeyAdminSummary.stats.failedCredentials,
              detail: <>{props.providerKeyAdminSummary.stats.untestedCredentials} untested</>,
            }
            ]}
          >
<div className="workspace-provider-key-list">
              {props.providerKeyAdminSummary.credentials.length ? (
                props.providerKeyAdminSummary.credentials.map((credential) => (
                  <article
                    className={`workspace-provider-key-card workspace-provider-key-card--${credential.lastTestStatus}`}
                    key={credential.credentialId}
                  >
                    <div>
                      <strong>{credential.label}</strong>
                      <p>
                        {credential.providerId} · {credential.maskedKey}
                      </p>
                      <small>
                        {formatProviderKeyTestStatus(credential.lastTestStatus)}
                        {credential.lastTestedAt
                          ? ` · ${credential.lastTestedAt.slice(0, 10)}`
                          : ''}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No workspace provider keys saved yet. Use the Provider Keys
                  panel to add Anthropic or OpenAI keys.
                </p>
              )}
            </div>
            {props.providerKeyAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {props.providerKeyAdminSummary.availableActions.map((action) => (
                  <button
                    key={action}
                    className="secondary-button"
                    type="button"
                    disabled={props.providerKeyAdminAction !== 'idle'}
                    onClick={() => void props.handleProviderKeyAdminAction(action)}
                  >
                    {formatProviderKeyAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.observabilityAdminSummary ? (
          <BillingAdminPanel
            title="Observability admin"
            panelClassName="workspace-observability-admin"
            role={props.observabilityAdminSummary.role}
            guidance={props.observabilityAdminSummary.guidance}
            stats={[
            {
              label: 'Recent events',
              value: props.observabilityAdminSummary.stats.totalEvents,
              detail: <>{props.observabilityAdminSummary.stats.pipelinePhaseEvents} pipeline</>,
            },
            {
              label: 'Active alerts',
              value: props.observabilityAdminSummary.alerts?.length ?? 0,
              detail: <>worker / stream lag / provider</>,
            },
            {
              label: 'Errors / warnings',
              value: props.observabilityAdminSummary.stats.errorEvents,
              detail: <>{props.observabilityAdminSummary.stats.warnEvents} warnings</>,
            }
            ]}
          >
{(props.observabilityAdminSummary.alerts?.length ?? 0) > 0 ? (
              <div className="workspace-observability-event-list">
                {props.observabilityAdminSummary.alerts.map((alert) => (
                  <article
                    className={`workspace-observability-event-card workspace-observability-event-card--${alert.severity === 'critical' ? 'error' : 'warn'}`}
                    key={alert.alertId}
                  >
                    <div>
                      <strong>{alert.type}</strong>
                      <p>{alert.message}</p>
                      <small>{alert.severity}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
<div className="workspace-observability-event-list">
              {props.observabilityAdminSummary.events.length ? (
                props.observabilityAdminSummary.events.map((event) => (
                  <article
                    className={`workspace-observability-event-card workspace-observability-event-card--${event.level}`}
                    key={`${event.eventName}-${event.timestamp}`}
                  >
                    <div>
                      <strong>{event.eventName}</strong>
                      <p>{formatObservabilityEventLevel(event.level)}</p>
                      <small>
                        {event.timestamp.slice(0, 19).replace('T', ' ')}
                        {event.runId ? ` · ${event.runId}` : ''}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No recent observability events recorded for this workspace yet.
                </p>
              )}
            </div>
            {props.observabilityAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {props.observabilityAdminSummary.availableActions.map((action) => (
                  <button
                    key={action}
                    className={
                      action === 'clear_observability_buffer'
                        ? 'danger-button'
                        : 'secondary-button'
                    }
                    type="button"
                    disabled={props.observabilityAdminAction !== 'idle'}
                    onClick={() => void props.handleObservabilityAdminAction(action)}
                  >
                    {formatObservabilityAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.promptRegressionAdminSummary ? (
          <BillingAdminPanel
            title="Prompt regression admin"
            panelClassName="workspace-prompt-regression-admin"
            role={props.promptRegressionAdminSummary.role}
            guidance={props.promptRegressionAdminSummary.guidance}
            stats={[
            {
              label: 'Regression cases',
              value: props.promptRegressionAdminSummary.stats.totalCases,
              detail: <>{props.promptRegressionAdminSummary.stats.passedCases} passed</>,
            },
            {
              label: 'Failures / drift',
              value: props.promptRegressionAdminSummary.stats.failedCases,
              detail: <>{props.promptRegressionAdminSummary.stats.promptVersionDriftCount} drift</>,
            }
            ]}
          >
<p className="clear-copy">
              Generated at {props.promptRegressionAdminSummary.generatedAt.slice(0, 19).replace('T', ' ')}
            </p>
            <div className="workspace-prompt-regression-list">
              {props.promptRegressionAdminSummary.cases.map((regressionCase) => (
                <article
                  className={`workspace-prompt-regression-card workspace-prompt-regression-card--${regressionCase.passed ? 'pass' : 'fail'}`}
                  key={regressionCase.caseId}
                >
                  <div>
                    <strong>{regressionCase.caseId}</strong>
                    <p>
                      {regressionCase.expectedPromptVersion} →{' '}
                      {regressionCase.actualPromptVersion}
                    </p>
                    <small>
                      Clarity {formatPromptRegressionScore(regressionCase.clarityScore)} ·
                      Usefulness {formatPromptRegressionScore(regressionCase.usefulnessScore)}
                      {regressionCase.promptVersionChanged ? ' · Drift detected' : ''}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {props.promptRegressionAdminSummary.availableActions.includes(
              'rerun_prompt_regression',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.promptRegressionAdminAction !== 'idle'}
                onClick={() =>
                  void props.handlePromptRegressionAdminAction('rerun_prompt_regression')
                }
              >
                {formatPromptRegressionAdminAction('rerun_prompt_regression')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.runHistoryAdminSummary ? (
          <BillingAdminPanel
            title="Run history admin"
            panelClassName="workspace-run-history-admin"
            role={props.runHistoryAdminSummary.role}
            guidance={props.runHistoryAdminSummary.guidance}
            stats={[
            {
              label: 'Artifacts',
              value: props.runHistoryAdminSummary.stats.totalArtifacts,
              detail: <>{props.runHistoryAdminSummary.stats.uniqueRunCount} runs</>,
            },
            {
              label: 'Artifact mix',
              value: props.runHistoryAdminSummary.stats.ideaBriefCount,
              detail: <>{props.runHistoryAdminSummary.stats.masterPromptCount} master prompt ·{' '}
                  {props.runHistoryAdminSummary.stats.todoListCount} todo list</>,
            }
            ]}
          >
<div className="workspace-run-history-list">
              {props.runHistoryAdminSummary.artifacts.length ? (
                props.runHistoryAdminSummary.artifacts.map((artifact) => (
                  <article
                    className="workspace-run-history-card"
                    key={artifact.artifactId}
                  >
                    <div>
                      <strong>{formatArtifactType(artifact.artifactType)}</strong>
                      <p>
                        Run {artifact.runId} · v{artifact.artifactVersion}
                      </p>
                      <small>
                        {artifact.createdAt.slice(0, 19).replace('T', ' ')}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No persisted run artifacts recorded for this workspace yet.
                </p>
              )}
            </div>
            <AdminExportActions
              actions={[
                {
                  label: 'Export run history CSV',
                  disabled: props.runHistoryAdminAction !== 'idle',
                  onClick: () => void props.handleExportRunHistory('csv'),
                },
                {
                  label: 'Export run history JSON',
                  disabled: props.runHistoryAdminAction !== 'idle',
                  onClick: () => void props.handleExportRunHistory('json'),
                },
              ]}
            />
            {props.runHistoryAdminSummary.availableActions.includes(
              'refresh_run_history_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.runHistoryAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleRunHistoryAdminAction('refresh_run_history_summary')
                }
              >
                {formatRunHistoryAdminAction('refresh_run_history_summary')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.streamRecoveryAdminSummary ? (
          <BillingAdminPanel
            title="Stream recovery admin"
            panelClassName="workspace-stream-recovery-admin"
            role={props.streamRecoveryAdminSummary.role}
            guidance={props.streamRecoveryAdminSummary.guidance}
            stats={[
            {
              label: 'Buffered runs',
              value: props.streamRecoveryAdminSummary.stats.bufferedRunCount,
              detail: <>{props.streamRecoveryAdminSummary.stats.totalBufferedEvents} events</>,
            },
            {
              label: 'Active / terminal',
              value: props.streamRecoveryAdminSummary.stats.activeRunCount,
              detail: <>{props.streamRecoveryAdminSummary.stats.terminalRunCount} terminal</>,
            }
            ]}
          >
<div className="workspace-stream-recovery-list">
              {props.streamRecoveryAdminSummary.bufferedRuns.length ? (
                props.streamRecoveryAdminSummary.bufferedRuns.map((bufferedRun) => (
                  <article
                    className={`workspace-stream-recovery-card workspace-stream-recovery-card--${bufferedRun.terminal ? 'terminal' : 'active'}`}
                    key={bufferedRun.runId}
                  >
                    <div>
                      <strong>{bufferedRun.runId}</strong>
                      <p>
                        {formatStreamEventType(bufferedRun.lastEventType)} ·{' '}
                        {bufferedRun.eventCount} event
                        {bufferedRun.eventCount === 1 ? '' : 's'}
                      </p>
                      <small>
                        {bufferedRun.lastEventAt
                          ? bufferedRun.lastEventAt.slice(0, 19).replace('T', ' ')
                          : 'No buffered events yet'}
                        {bufferedRun.terminal ? ' · Terminal' : ' · Active'}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No buffered SSE runs recorded for this workspace yet.
                </p>
              )}
            </div>
            {props.streamRecoveryAdminSummary.availableActions.includes(
              'refresh_stream_recovery_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.streamRecoveryAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleStreamRecoveryAdminAction(
                    'refresh_stream_recovery_summary',
                  )
                }
              >
                {formatStreamRecoveryAdminAction('refresh_stream_recovery_summary')}
              </button>
            ) : null}
            {props.streamRecoveryAdminSummary.availableActions.includes(
              'clear_workspace_stream_buffers',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.streamRecoveryAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleStreamRecoveryAdminAction(
                    'clear_workspace_stream_buffers',
                  )
                }
              >
                {formatStreamRecoveryAdminAction('clear_workspace_stream_buffers')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.idempotencyAdminSummary ? (
          <BillingAdminPanel
            title="Idempotency admin"
            panelClassName="workspace-idempotency-admin"
            role={props.idempotencyAdminSummary.role}
            guidance={props.idempotencyAdminSummary.guidance}
            stats={[
            {
              label: 'Idempotency keys',
              value: props.idempotencyAdminSummary.stats.totalKeys,
              detail: <>{props.idempotencyAdminSummary.stats.activeReservations} active</>,
            },
            {
              label: 'Runs / expired',
              value: props.idempotencyAdminSummary.stats.linkedRunCount,
              detail: <>{props.idempotencyAdminSummary.stats.expiredKeys} expired</>,
            }
            ]}
          >
<div className="workspace-idempotency-list">
              {props.idempotencyAdminSummary.records.length ? (
                props.idempotencyAdminSummary.records.map((record) => (
                  <article
                    className={`workspace-idempotency-card workspace-idempotency-card--${record.reservationActive ? 'active' : record.expired ? 'expired' : 'idle'}`}
                    key={record.idempotencyKey}
                  >
                    <div>
                      <strong>{record.idempotencyKey}</strong>
                      <p>{record.runId ? `Run ${record.runId}` : 'Reservation only'}</p>
                      <small>
                        {record.expiresAt
                          ? record.expiresAt.slice(0, 19).replace('T', ' ')
                          : 'No expiry recorded'}
                        {record.reservationActive ? ' · Active reservation' : ''}
                        {record.expired ? ' · Expired' : ''}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No idempotency keys recorded for this workspace yet.
                </p>
              )}
            </div>
            {props.idempotencyAdminSummary.availableActions.includes(
              'refresh_idempotency_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.idempotencyAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleIdempotencyAdminAction('refresh_idempotency_summary')
                }
              >
                {formatIdempotencyAdminAction('refresh_idempotency_summary')}
              </button>
            ) : null}
            {props.idempotencyAdminSummary.availableActions.includes(
              'clear_workspace_idempotency_reservations',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.idempotencyAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleIdempotencyAdminAction(
                    'clear_workspace_idempotency_reservations',
                  )
                }
              >
                {formatIdempotencyAdminAction(
                  'clear_workspace_idempotency_reservations',
                )}
              </button>
            ) : null}
            {props.idempotencyAdminSummary.availableActions.includes(
              'purge_expired_idempotency_keys',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.idempotencyAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleIdempotencyAdminAction(
                    'purge_expired_idempotency_keys',
                  )
                }
              >
                {formatIdempotencyAdminAction('purge_expired_idempotency_keys')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.quotaAdminSummary ? (
          <BillingAdminPanel
            title="Quota admin"
            panelClassName="workspace-quota-admin"
            role={props.quotaAdminSummary.role}
            guidance={props.quotaAdminSummary.guidance}
            stats={[
            {
              label: 'Token quota',
              value: `${props.quotaAdminSummary.stats.tokenUtilizationPercent}%`,
              detail: <>{props.quotaAdminSummary.usage.dailyUsage.totalTokens.toLocaleString()} /{' '}
                  {props.quotaAdminSummary.usage.dailyTokenLimit.toLocaleString()}</>,
            },
            {
              label: 'Cost quota',
              value: `${props.quotaAdminSummary.stats.costUtilizationPercent}%`,
              detail: <>${props.quotaAdminSummary.usage.dailyUsage.estimatedCostUsd.toFixed(2)} / $
                  {props.quotaAdminSummary.usage.dailyCostLimitUsd.toFixed(2)}
                  {props.quotaAdminSummary.stats.quotaExceeded ? ' · Exceeded' : ''}</>,
            }
            ]}
          >
<div className="workspace-quota-list">
              {props.quotaAdminSummary.records.length ? (
                props.quotaAdminSummary.records.map((record) => (
                  <article className="workspace-quota-card" key={record.usageEventId}>
                    <div>
                      <strong>{formatUsagePhase(record.phase)}</strong>
                      <p>
                        Run {record.runId} · {record.totalTokens.toLocaleString()} tokens
                      </p>
                      <small>
                        ${record.estimatedCostUsd.toFixed(2)} ·{' '}
                        {record.createdAt.slice(0, 19).replace('T', ' ')}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">
                  No usage events recorded for this workspace yet.
                </p>
              )}
            </div>
            {props.quotaAdminSummary.availableActions.includes('refresh_quota_summary') ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.quotaAdminAction !== 'idle'}
                onClick={() => void props.handleQuotaAdminAction('refresh_quota_summary')}
              >
                {formatQuotaAdminAction('refresh_quota_summary')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.deploymentAdminSummary ? (
          <BillingAdminPanel
            title="Deployment admin"
            panelClassName="workspace-deployment-admin"
            role={props.deploymentAdminSummary.role}
            guidance={props.deploymentAdminSummary.guidance}
            stats={[
            {
              label: 'Readiness',
              value: props.deploymentAdminSummary.readinessStatus,
              detail: <>{props.deploymentAdminSummary.stats.healthyDependencyCount}/
                  {props.deploymentAdminSummary.stats.totalDependencies} dependencies</>,
            },
            {
              label: 'API version',
              value: props.deploymentAdminSummary.stats.apiVersion,
              detail: <>{props.deploymentAdminSummary.nodeEnv} · {props.deploymentAdminSummary.webOrigin}</>,
            }
            ]}
          >
<div className="workspace-deployment-list">
              {props.deploymentAdminSummary.dependencies.map((dependency) => (
                <article
                  className={`workspace-deployment-card workspace-deployment-card--${dependency.status}`}
                  key={dependency.name}
                >
                  <div>
                    <strong>{formatDependencyName(dependency.name)}</strong>
                    <p>{formatDependencyStatus(dependency.status)}</p>
                    {dependency.detail ? <small>{dependency.detail}</small> : null}
                  </div>
                </article>
              ))}
            </div>
            <p className="clear-copy">
              Checked at {props.deploymentAdminSummary.checkedAt.slice(0, 19).replace('T', ' ')}
            </p>
            {props.deploymentAdminSummary.availableActions.includes(
              'refresh_deployment_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.deploymentAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleDeploymentAdminAction('refresh_deployment_summary')
                }
              >
                {formatDeploymentAdminAction('refresh_deployment_summary')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}

        {props.migrationAdminSummary ? (
          <BillingAdminPanel
            title="Migration admin"
            panelClassName="workspace-migration-admin"
            role={props.migrationAdminSummary.role}
            guidance={props.migrationAdminSummary.guidance}
            stats={[
            {
              label: 'Applied',
              value: props.migrationAdminSummary.stats.appliedCount,
              detail: <>{props.migrationAdminSummary.stats.pendingCount} pending of{' '}
                  {props.migrationAdminSummary.stats.totalMigrations}</>,
            },
            {
              label: 'Schema table',
              value: props.migrationAdminSummary.stats.schemaMigrationsTableExists
                    ? 'Ready'
                    : 'Missing',
              detail: 'schema_migrations tracking',
            }
            ]}
          >
<div className="workspace-migration-list">
              {props.migrationAdminSummary.records.length ? (
                props.migrationAdminSummary.records.map((record) => (
                  <article
                    className={`workspace-migration-card workspace-migration-card--${record.status}`}
                    key={record.version}
                  >
                    <div>
                      <strong>{record.version}</strong>
                      <p>{formatMigrationStatus(record.status)}</p>
                      {record.appliedAt ? (
                        <small>
                          {record.appliedAt.slice(0, 19).replace('T', ' ')}
                        </small>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <p className="clear-copy">No migration files discovered yet.</p>
              )}
            </div>
            {props.migrationAdminSummary.availableActions.includes(
              'refresh_migration_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={props.migrationAdminAction !== 'idle'}
                onClick={() =>
                  void props.handleMigrationAdminAction('refresh_migration_summary')
                }
              >
                {formatMigrationAdminAction('refresh_migration_summary')}
              </button>
            ) : null}
          </BillingAdminPanel>
        ) : null}
    </>
  )
}
