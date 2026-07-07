// @ts-nocheck
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
          <div className="billing-admin workspace-model-health-admin">
            <div className="billing-admin__header">
              <span>Model health admin</span>
              <strong>{props.modelHealthAdminSummary.role}</strong>
            </div>
            <p>{props.modelHealthAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Active models</span>
                <strong>{props.modelHealthAdminSummary.stats.activeModels}</strong>
                <small>
                  {props.modelHealthAdminSummary.stats.totalModels} total in registry
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Degraded models</span>
                <strong>{props.modelHealthAdminSummary.stats.degradedModels}</strong>
                <small>
                  {props.modelHealthAdminSummary.stats.candidateModels} candidates
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.shieldReviewAdminSummary ? (
          <div className="billing-admin workspace-shield-review-admin">
            <div className="billing-admin__header">
              <span>Shield review admin</span>
              <strong>{props.shieldReviewAdminSummary.role}</strong>
            </div>
            <p>{props.shieldReviewAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Review cases</span>
                <strong>{props.shieldReviewAdminSummary.stats.totalCases}</strong>
                <small>{props.shieldReviewAdminSummary.stats.passedCases} passed</small>
              </article>
              <article className="billing-admin-stat">
                <span>False positives</span>
                <strong>{props.shieldReviewAdminSummary.stats.falsePositiveCount}</strong>
                <small>
                  {formatFalsePositiveRate(
                    props.shieldReviewAdminSummary.stats.falsePositiveRate,
                  )}{' '}
                  rate
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.providerKeyAdminSummary ? (
          <div className="billing-admin workspace-provider-key-admin">
            <div className="billing-admin__header">
              <span>Provider key admin</span>
              <strong>{props.providerKeyAdminSummary.role}</strong>
            </div>
            <p>{props.providerKeyAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Workspace keys</span>
                <strong>{props.providerKeyAdminSummary.stats.totalCredentials}</strong>
                <small>
                  {props.providerKeyAdminSummary.stats.passedCredentials} passed
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Failed / untested</span>
                <strong>{props.providerKeyAdminSummary.stats.failedCredentials}</strong>
                <small>
                  {props.providerKeyAdminSummary.stats.untestedCredentials} untested
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.observabilityAdminSummary ? (
          <div className="billing-admin workspace-observability-admin">
            <div className="billing-admin__header">
              <span>Observability admin</span>
              <strong>{props.observabilityAdminSummary.role}</strong>
            </div>
            <p>{props.observabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Recent events</span>
                <strong>{props.observabilityAdminSummary.stats.totalEvents}</strong>
                <small>
                  {props.observabilityAdminSummary.stats.pipelinePhaseEvents} pipeline
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Errors / warnings</span>
                <strong>{props.observabilityAdminSummary.stats.errorEvents}</strong>
                <small>{props.observabilityAdminSummary.stats.warnEvents} warnings</small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.promptRegressionAdminSummary ? (
          <div className="billing-admin workspace-prompt-regression-admin">
            <div className="billing-admin__header">
              <span>Prompt regression admin</span>
              <strong>{props.promptRegressionAdminSummary.role}</strong>
            </div>
            <p>{props.promptRegressionAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Regression cases</span>
                <strong>{props.promptRegressionAdminSummary.stats.totalCases}</strong>
                <small>{props.promptRegressionAdminSummary.stats.passedCases} passed</small>
              </article>
              <article className="billing-admin-stat">
                <span>Failures / drift</span>
                <strong>{props.promptRegressionAdminSummary.stats.failedCases}</strong>
                <small>
                  {props.promptRegressionAdminSummary.stats.promptVersionDriftCount} drift
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.runHistoryAdminSummary ? (
          <div className="billing-admin workspace-run-history-admin">
            <div className="billing-admin__header">
              <span>Run history admin</span>
              <strong>{props.runHistoryAdminSummary.role}</strong>
            </div>
            <p>{props.runHistoryAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Artifacts</span>
                <strong>{props.runHistoryAdminSummary.stats.totalArtifacts}</strong>
                <small>{props.runHistoryAdminSummary.stats.uniqueRunCount} runs</small>
              </article>
              <article className="billing-admin-stat">
                <span>Artifact mix</span>
                <strong>{props.runHistoryAdminSummary.stats.executiveSummaryCount}</strong>
                <small>
                  {props.runHistoryAdminSummary.stats.prdCount} PRD ·{' '}
                  {props.runHistoryAdminSummary.stats.developmentPromptCount} dev prompt
                </small>
              </article>
            </div>
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
            <div className="billing-export-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={props.runHistoryAdminAction !== 'idle'}
                onClick={() => void props.handleExportRunHistory('csv')}
              >
                Export run history CSV
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={props.runHistoryAdminAction !== 'idle'}
                onClick={() => void props.handleExportRunHistory('json')}
              >
                Export run history JSON
              </button>
            </div>
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
          </div>
        ) : null}

        {props.streamRecoveryAdminSummary ? (
          <div className="billing-admin workspace-stream-recovery-admin">
            <div className="billing-admin__header">
              <span>Stream recovery admin</span>
              <strong>{props.streamRecoveryAdminSummary.role}</strong>
            </div>
            <p>{props.streamRecoveryAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Buffered runs</span>
                <strong>{props.streamRecoveryAdminSummary.stats.bufferedRunCount}</strong>
                <small>
                  {props.streamRecoveryAdminSummary.stats.totalBufferedEvents} events
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Active / terminal</span>
                <strong>{props.streamRecoveryAdminSummary.stats.activeRunCount}</strong>
                <small>
                  {props.streamRecoveryAdminSummary.stats.terminalRunCount} terminal
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.idempotencyAdminSummary ? (
          <div className="billing-admin workspace-idempotency-admin">
            <div className="billing-admin__header">
              <span>Idempotency admin</span>
              <strong>{props.idempotencyAdminSummary.role}</strong>
            </div>
            <p>{props.idempotencyAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Idempotency keys</span>
                <strong>{props.idempotencyAdminSummary.stats.totalKeys}</strong>
                <small>
                  {props.idempotencyAdminSummary.stats.activeReservations} active
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Runs / expired</span>
                <strong>{props.idempotencyAdminSummary.stats.linkedRunCount}</strong>
                <small>{props.idempotencyAdminSummary.stats.expiredKeys} expired</small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.quotaAdminSummary ? (
          <div className="billing-admin workspace-quota-admin">
            <div className="billing-admin__header">
              <span>Quota admin</span>
              <strong>{props.quotaAdminSummary.role}</strong>
            </div>
            <p>{props.quotaAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Token quota</span>
                <strong>{props.quotaAdminSummary.stats.tokenUtilizationPercent}%</strong>
                <small>
                  {props.quotaAdminSummary.usage.dailyUsage.totalTokens.toLocaleString()} /{' '}
                  {props.quotaAdminSummary.usage.dailyTokenLimit.toLocaleString()}
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Cost quota</span>
                <strong>{props.quotaAdminSummary.stats.costUtilizationPercent}%</strong>
                <small>
                  ${props.quotaAdminSummary.usage.dailyUsage.estimatedCostUsd.toFixed(2)} / $
                  {props.quotaAdminSummary.usage.dailyCostLimitUsd.toFixed(2)}
                  {props.quotaAdminSummary.stats.quotaExceeded ? ' · Exceeded' : ''}
                </small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.deploymentAdminSummary ? (
          <div className="billing-admin workspace-deployment-admin">
            <div className="billing-admin__header">
              <span>Deployment admin</span>
              <strong>{props.deploymentAdminSummary.role}</strong>
            </div>
            <p>{props.deploymentAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Readiness</span>
                <strong>{props.deploymentAdminSummary.readinessStatus}</strong>
                <small>
                  {props.deploymentAdminSummary.stats.healthyDependencyCount}/
                  {props.deploymentAdminSummary.stats.totalDependencies} dependencies
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>API version</span>
                <strong>{props.deploymentAdminSummary.stats.apiVersion}</strong>
                <small>{props.deploymentAdminSummary.nodeEnv} · {props.deploymentAdminSummary.webOrigin}</small>
              </article>
            </div>
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
          </div>
        ) : null}

        {props.migrationAdminSummary ? (
          <div className="billing-admin workspace-migration-admin">
            <div className="billing-admin__header">
              <span>Migration admin</span>
              <strong>{props.migrationAdminSummary.role}</strong>
            </div>
            <p>{props.migrationAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Applied</span>
                <strong>{props.migrationAdminSummary.stats.appliedCount}</strong>
                <small>
                  {props.migrationAdminSummary.stats.pendingCount} pending of{' '}
                  {props.migrationAdminSummary.stats.totalMigrations}
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Schema table</span>
                <strong>
                  {props.migrationAdminSummary.stats.schemaMigrationsTableExists
                    ? 'Ready'
                    : 'Missing'}
                </strong>
                <small>schema_migrations tracking</small>
              </article>
            </div>
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
          </div>
        ) : null}
    </>
  )
}
