import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import type {
  AuthCapabilitiesResponse,
  AuthRolloutResponse,
  AuthSessionResponse,
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
  LlmRolloutResponse,
  ModelRouterRolloutResponse,
  ModelHealthAdminSummaryResponse,
  ResearchRolloutResponse,
  ShieldRolloutResponse,
  ShieldReviewAdminSummaryResponse,
  ProviderCredentialsRolloutResponse,
  ProviderKeyAdminSummaryResponse,
  ObservabilityRolloutResponse,
  ObservabilityAdminSummaryResponse,
  PromptEvaluationRolloutResponse,
  PromptRegressionAdminSummaryResponse,
  RunHistoryRolloutResponse,
  RunHistoryAdminSummaryResponse,
  StreamReplayRolloutResponse,
  StreamRecoveryAdminSummaryResponse,
  IdempotencyRolloutResponse,
  IdempotencyAdminSummaryResponse,
  UsageLimitsRolloutResponse,
  QuotaAdminSummaryResponse,
  DeploymentRolloutResponse,
  DeploymentAdminSummaryResponse,
  MigrationRolloutResponse,
  MigrationAdminSummaryResponse,
  BackupRolloutResponse,
  BackupAdminSummaryResponse,
  AuditTrailRolloutResponse,
  AuditTrailAdminSummaryResponse,
  ComplianceRolloutResponse,
  ComplianceAdminSummaryResponse,
  IncidentResponseRolloutResponse,
  IncidentAdminSummaryResponse,
  ReleaseRolloutResponse,
  ReleaseAdminSummaryResponse,
  SloRolloutResponse,
  SloAdminSummaryResponse,
  CapacityRolloutResponse,
  CapacityAdminSummaryResponse,
  PerformanceRolloutResponse,
  PerformanceAdminSummaryResponse,
  ResilienceRolloutResponse,
  ResilienceAdminSummaryResponse,
  AvailabilityRolloutResponse,
  AvailabilityAdminSummaryResponse,
  ReliabilityRolloutResponse,
  ReliabilityAdminSummaryResponse,
  StabilityRolloutResponse,
  StabilityAdminSummaryResponse,
  ConsistencyRolloutResponse,
  ConsistencyAdminSummaryResponse,
  IntegrityRolloutResponse,
  IntegrityAdminSummaryResponse,
  DurabilityRolloutResponse,
  DurabilityAdminSummaryResponse,
  RecoverabilityRolloutResponse,
  RecoverabilityAdminSummaryResponse,
  MaintainabilityRolloutResponse,
  MaintainabilityAdminSummaryResponse,
  ScalabilityRolloutResponse,
  ScalabilityAdminSummaryResponse,
  TraceabilityRolloutResponse,
  TraceabilityAdminSummaryResponse,
  RunCapabilitiesResponse,
  TemporalRolloutResponse,
  TemporalRuntimeHealthResponse,
  UsageAdminSummaryResponse,
  WorkspaceMemberAdminSummaryResponse,
  WorkspaceSettingsAdminSummaryResponse,
} from '@ai-war-room/schemas'
import './App.css'
import {
  fetchAuthRollout,
  formatAuthRolloutCheckStatus,
  formatAuthRolloutStatus,
} from './auth-ui'
import {
  fetchLlmRollout,
  formatLlmRolloutCheckStatus,
  formatLlmRolloutStatus,
} from './llm-ui'
import {
  fetchResearchRollout,
  formatResearchRolloutCheckStatus,
  formatResearchRolloutStatus,
} from './research-ui'
import {
  fetchTemporalRollout,
  formatTemporalRolloutCheckStatus,
  formatTemporalRolloutStatus,
} from './temporal-ui'
import {
  executeModelHealthAdminAction,
  fetchModelHealthAdminSummary,
  fetchModelRouterRollout,
  formatModelHealthStatus,
  formatModelLifecycleStatus,
  formatModelRouterRolloutCheckStatus,
  formatModelRouterRolloutStatus,
} from './model-router-ui'
import {
  executeShieldReviewAdminAction,
  fetchShieldReviewAdminSummary,
  fetchShieldRollout,
  formatFalsePositiveRate,
  formatShieldReviewAdminAction,
  formatShieldReviewStatus,
  formatShieldRolloutCheckStatus,
  formatShieldRolloutStatus,
} from './shield-ui'
import {
  executeProviderKeyAdminAction,
  fetchProviderCredentialsRollout,
  fetchProviderKeyAdminSummary,
  formatProviderCredentialsRolloutCheckStatus,
  formatProviderCredentialsRolloutStatus,
  formatProviderKeyAdminAction,
  formatProviderKeyTestStatus,
} from './provider-credentials-ui'
import {
  executeObservabilityAdminAction,
  fetchObservabilityAdminSummary,
  fetchObservabilityRollout,
  formatObservabilityAdminAction,
  formatObservabilityEventLevel,
  formatObservabilityRolloutCheckStatus,
  formatObservabilityRolloutStatus,
} from './observability-ui'
import {
  executePromptRegressionAdminAction,
  fetchPromptEvaluationRollout,
  fetchPromptRegressionAdminSummary,
  formatPromptEvaluationRolloutCheckStatus,
  formatPromptEvaluationRolloutStatus,
  formatPromptRegressionAdminAction,
  formatPromptRegressionScore,
} from './evaluation-ui'
import {
  downloadRunHistoryExport,
  executeRunHistoryAdminAction,
  fetchRunHistoryAdminSummary,
  fetchRunHistoryRollout,
  formatArtifactType,
  formatRunHistoryAdminAction,
  formatRunHistoryRolloutCheckStatus,
  formatRunHistoryRolloutStatus,
} from './run-history-ui'
import {
  executeStreamRecoveryAdminAction,
  fetchStreamRecoveryAdminSummary,
  fetchStreamReplayRollout,
  formatStreamEventType,
  formatStreamRecoveryAdminAction,
  formatStreamReplayRolloutCheckStatus,
  formatStreamReplayRolloutStatus,
} from './stream-replay-ui'
import {
  executeIdempotencyAdminAction,
  fetchIdempotencyAdminSummary,
  fetchIdempotencyRollout,
  formatIdempotencyAdminAction,
  formatIdempotencyRolloutCheckStatus,
  formatIdempotencyRolloutStatus,
} from './idempotency-ui'
import {
  executeQuotaAdminAction,
  fetchQuotaAdminSummary,
  fetchUsageLimitsRollout,
  formatQuotaAdminAction,
  formatUsageLimitsRolloutCheckStatus,
  formatUsageLimitsRolloutStatus,
  formatUsagePhase,
} from './usage-limits-ui'
import {
  executeDeploymentAdminAction,
  fetchDeploymentAdminSummary,
  fetchDeploymentRollout,
  formatDeploymentAdminAction,
  formatDeploymentRolloutCheckStatus,
  formatDeploymentRolloutStatus,
  formatDependencyName,
  formatDependencyStatus,
} from './deployment-ui'
import {
  executeMigrationAdminAction,
  fetchMigrationAdminSummary,
  fetchMigrationRollout,
  formatMigrationAdminAction,
  formatMigrationRolloutCheckStatus,
  formatMigrationRolloutStatus,
  formatMigrationStatus,
} from './migrations-ui'
import {
  executeBackupAdminAction,
  fetchBackupAdminSummary,
  fetchBackupRollout,
  formatBackupAdminAction,
  formatBackupDomain,
  formatBackupRolloutCheckStatus,
  formatBackupRolloutStatus,
} from './backup-ui'
import {
  executeAuditAdminAction,
  fetchAuditAdminSummary,
  fetchAuditTrailRollout,
  formatAuditAdminAction,
  formatAuditDomain,
  formatAuditTrailRolloutCheckStatus,
  formatAuditTrailRolloutStatus,
} from './audit-trail-ui'
import {
  executeComplianceAdminAction,
  fetchComplianceAdminSummary,
  fetchComplianceRollout,
  formatComplianceAdminAction,
  formatComplianceDomain,
  formatComplianceRolloutCheckStatus,
  formatComplianceRolloutStatus,
} from './compliance-ui'
import {
  executeIncidentAdminAction,
  fetchIncidentAdminSummary,
  fetchIncidentResponseRollout,
  formatIncidentAdminAction,
  formatIncidentDomain,
  formatIncidentResponseRolloutCheckStatus,
  formatIncidentResponseRolloutStatus,
} from './incident-response-ui'
import {
  executeReleaseAdminAction,
  fetchReleaseAdminSummary,
  fetchReleaseRollout,
  formatReleaseAdminAction,
  formatReleaseDomain,
  formatReleaseRolloutCheckStatus,
  formatReleaseRolloutStatus,
} from './release-ui'
import {
  executeSloAdminAction,
  fetchSloAdminSummary,
  fetchSloRollout,
  formatSloAdminAction,
  formatSloDomain,
  formatSloRolloutCheckStatus,
  formatSloRolloutStatus,
} from './slo-ui'
import {
  executeCapacityAdminAction,
  fetchCapacityAdminSummary,
  fetchCapacityRollout,
  formatCapacityAdminAction,
  formatCapacityDomain,
  formatCapacityRolloutCheckStatus,
  formatCapacityRolloutStatus,
} from './capacity-ui'
import {
  executePerformanceAdminAction,
  fetchPerformanceAdminSummary,
  fetchPerformanceRollout,
  formatPerformanceAdminAction,
  formatPerformanceDomain,
  formatPerformanceRolloutCheckStatus,
  formatPerformanceRolloutStatus,
} from './performance-ui'
import {
  executeResilienceAdminAction,
  fetchResilienceAdminSummary,
  fetchResilienceRollout,
  formatResilienceAdminAction,
  formatResilienceDomain,
  formatResilienceRolloutCheckStatus,
  formatResilienceRolloutStatus,
} from './resilience-ui'
import {
  executeAvailabilityAdminAction,
  fetchAvailabilityAdminSummary,
  fetchAvailabilityRollout,
  formatAvailabilityAdminAction,
  formatAvailabilityDomain,
  formatAvailabilityRolloutCheckStatus,
  formatAvailabilityRolloutStatus,
} from './availability-ui'
import {
  executeReliabilityAdminAction,
  fetchReliabilityAdminSummary,
  fetchReliabilityRollout,
  formatReliabilityAdminAction,
  formatReliabilityDomain,
  formatReliabilityRolloutCheckStatus,
  formatReliabilityRolloutStatus,
} from './reliability-ui'
import {
  executeStabilityAdminAction,
  fetchStabilityAdminSummary,
  fetchStabilityRollout,
  formatStabilityAdminAction,
  formatStabilityDomain,
  formatStabilityRolloutCheckStatus,
  formatStabilityRolloutStatus,
} from './stability-ui'
import {
  executeConsistencyAdminAction,
  fetchConsistencyAdminSummary,
  fetchConsistencyRollout,
  formatConsistencyAdminAction,
  formatConsistencyDomain,
  formatConsistencyRolloutCheckStatus,
  formatConsistencyRolloutStatus,
} from './consistency-ui'
import {
  executeIntegrityAdminAction,
  fetchIntegrityAdminSummary,
  fetchIntegrityRollout,
  formatIntegrityAdminAction,
  formatIntegrityDomain,
  formatIntegrityRolloutCheckStatus,
  formatIntegrityRolloutStatus,
} from './integrity-ui'
import {
  executeDurabilityAdminAction,
  fetchDurabilityAdminSummary,
  fetchDurabilityRollout,
  formatDurabilityAdminAction,
  formatDurabilityDomain,
  formatDurabilityRolloutCheckStatus,
  formatDurabilityRolloutStatus,
} from './durability-ui'
import {
  executeRecoverabilityAdminAction,
  fetchRecoverabilityAdminSummary,
  fetchRecoverabilityRollout,
  formatRecoverabilityAdminAction,
  formatRecoverabilityDomain,
  formatRecoverabilityRolloutCheckStatus,
  formatRecoverabilityRolloutStatus,
} from './recoverability-ui'
import {
  executeMaintainabilityAdminAction,
  fetchMaintainabilityAdminSummary,
  fetchMaintainabilityRollout,
  formatMaintainabilityAdminAction,
  formatMaintainabilityDomain,
  formatMaintainabilityRolloutCheckStatus,
  formatMaintainabilityRolloutStatus,
} from './maintainability-ui'
import {
  executeScalabilityAdminAction,
  fetchScalabilityAdminSummary,
  fetchScalabilityRollout,
  formatScalabilityAdminAction,
  formatScalabilityDomain,
  formatScalabilityRolloutCheckStatus,
  formatScalabilityRolloutStatus,
} from './scalability-ui'
import {
  executeTraceabilityAdminAction,
  fetchTraceabilityAdminSummary,
  fetchTraceabilityRollout,
  formatTraceabilityAdminAction,
  formatTraceabilityDomain,
  formatTraceabilityRolloutCheckStatus,
  formatTraceabilityRolloutStatus,
} from './traceability-ui'
import {
  buildBootstrapAuthHeaders,
  buildWorkspaceAuthHeaders,
  loadStoredAuthSession,
  saveStoredAuthSession,
} from './auth-headers'
import {
  clearBillingReturnHint,
  completeMockBillingCheckout,
  createBillingCheckoutSession,
  createCustomerPortalSession,
  cancelMockCustomerPortalSubscription,
  canOpenCustomerPortal,
  defaultWorkspaceId,
  describeBillingCapabilities,
  executeBillingAdminAction,
  fetchBillingAdminSummary,
  fetchBillingCapabilities,
  fetchBillingRollout,
  fetchBillingAlerts,
  fetchBillingInvoices,
  fetchBillingMeterUsageReports,
  fetchBillingNotifications,
  fetchBillingUsageSummary,
  fetchBillingWebhookEvents,
  fetchBillingWorkspaceStatus,
  downloadBillingInvoiceExport,
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatUsageCostLabel,
  formatUsageMeterLabel,
  formatUsagePercent,
  fetchMockCustomerPortal,
  formatBillingStatus,
  formatBillingAlertSeverity,
  formatBillingAdminAction,
  formatBillingNotificationStatus,
  formatBillingRolloutCheckStatus,
  formatBillingRolloutStatus,
  formatMeterUsageReportStatus,
  formatPaidTier,
  formatTierLimits,
  readBillingReturnHint,
  type MockCustomerPortalResponse,
} from './billing-ui'
import {
  executeUsageAdminAction,
  fetchUsageAdminSummary,
  fetchUsageCapabilities,
  formatUsageAdminAction,
} from './usage-ui'
import {
  executeWorkspaceMemberAdminAction,
  executeWorkspaceSettingsAdminAction,
  downloadWorkspaceAuditExport,
  fetchWorkspaceMemberAdminSummary,
  fetchWorkspaceSettingsAdminSummary,
  formatWorkspaceRole,
} from './workspace-ui'
import {
  type TemporalRunStartResponse,
  type TemporalWorkflowRecoveryResponse,
  type TemporalWorkflowStatus,
  canResumeTemporalWorkflow,
  createTemporalObservationTimeoutMessage,
  describeApprovedRunRuntime,
  formatTemporalFailureMessage,
  isTemporalTerminalStatus,
  loadPersistedTemporalWorkflow,
  savePersistedTemporalWorkflow,
  shouldUseTemporalRuntime,
  sleep,
  temporalInitialPollDelayMs,
  temporalObservationTimeoutMs,
  temporalPollIntervalMs,
  toTemporalRunStartResponse,
} from './temporal-runtime'

type ApiHealthState = 'checking' | 'online' | 'offline'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
type PipelineState = 'idle' | 'running' | 'completed' | 'error'

type ShieldFinding = {
  findingId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  span?: {
    start: number
    end: number
    quote: string
  }
  explanation: string
  recommendedAction: string
}

type DraftRun = {
  runId: string
  status: 'draft'
  idea: {
    rawIdea: string
    targetAudience?: string
    strategicGoals: string[]
    technicalPreferences: string[]
    constraints: string[]
    references: string[]
  }
  shieldScan: {
    status: 'clear' | 'warning' | 'blocked'
    maxSeverity: string
    findings: ShieldFinding[]
  }
  triage: {
    domain: string
    subdomain: string
    complexity: 'low' | 'medium' | 'high'
    marketConfidence: 'low' | 'medium' | 'high'
    securitySensitivity: 'low' | 'medium' | 'high'
    recommendedRunMode: 'standard' | 'deep'
    recommendedAgents: string[]
    estimatedDurationSeconds: number
    estimatedMaxCostUsd: number
    reasoningSummary: string
  }
  selectedAgents: string[]
  estimatedDurationSeconds: number
  estimatedMaxCostUsd: number
}

type ReviewDraft = {
  triage: DraftRun['triage']
  selectedAgents: string[]
}

type PipelineStep = {
  stepId: string
  label: string
  status: 'draft' | 'pending' | 'running' | 'completed' | 'failed' | 'blocked'
}

type PipelineStreamEvent =
  | {
      eventId: string
      type: 'status'
      stepId: string
      label: string
      status: 'running' | 'completed'
      timestamp: string
    }
  | {
      eventId: string
      type: 'artifact'
      artifactType: ArtifactResult['metadata']['artifactType']
      artifact: ArtifactResult
      timestamp: string
    }
  | {
      eventId: string
      type: 'completed'
      result: MockPipelineResult
      timestamp: string
    }
  | {
      eventId: string
      type: 'error'
      message: string
      timestamp: string
    }
  | {
      eventId: string
      type: 'workflow_status'
      runId: string
      workflowId: string
      temporalRunId?: string
      taskQueue: string
      status: TemporalWorkflowStatus
      timestamp: string
    }

type AgentExecution = {
  agentRole: string
  promptVersion: string
  modelProvider: string
  modelName: string
  validationStatus: 'valid' | 'repaired' | 'fallback'
  inputTokens: number
  outputTokens: number
  output: {
    summary: string
    strengths: string[]
    weaknesses: string[]
    risks: string[]
    recommendations: string[]
  }
}

type ArtifactResult = {
  metadata: {
    artifactId: string
    runId: string
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    artifactVersion: string
    promptVersion: string
    modelProvider: string
    modelName: string
    validationStatus: 'valid' | 'repaired' | 'fallback'
    shieldStatus: 'clear' | 'warning' | 'blocked'
    tokenUsage: {
      inputTokens: number
      outputTokens: number
    }
    createdAt: string
  }
  artifact: {
    artifactType: 'executive_summary' | 'prd' | 'development_prompt'
    content: Record<string, unknown>
  }
}

type ArtifactHistoryItem = {
  artifactId: string
  runId: string
  workspaceId: string
  artifactType: ArtifactResult['metadata']['artifactType']
  artifactVersion: string
  createdAt: string
  metadata: ArtifactResult['metadata']
  artifact: ArtifactResult['artifact']
}

type ArtifactHistoryResponse = {
  workspaceId: string
  artifacts: ArtifactHistoryItem[]
}

type ProviderCredential = {
  credentialId: string
  workspaceId: string
  providerId: 'anthropic' | 'openai'
  label: string
  maskedKey: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
  lastTestedAt?: string
  lastTestStatus: 'untested' | 'passed' | 'failed'
  lastTestError?: string
}

type ProviderCredentialInstructions = Record<
  'anthropic' | 'openai',
  {
    label: string
    url: string
    steps: string[]
  }
>

type ProviderCredentialListResponse = {
  workspaceId: string
  credentials: ProviderCredential[]
  needsProviderKey: boolean
  instructions: ProviderCredentialInstructions
}

type ProviderCredentialForm = {
  credentialId?: string
  providerId: 'anthropic' | 'openai'
  label: string
  apiKey: string
}

type MockPipelineResult = {
  status: 'completed'
  steps: PipelineStep[]
  agentOutputs: AgentExecution[]
  artifacts: ArtifactResult[]
}

type TemporalRunStatusResponse = {
  runId: string
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  taskQueue: string
  status: TemporalWorkflowStatus
  temporalEnabled: true
  checkedAt: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'
const reviewStorageKey = 'ai-war-room.review-draft'
const ideaStorageKey = 'ai-war-room.idea-draft'
const pipelineResultStorageKey = 'ai-war-room.pipeline-result'
const defaultProviderCredentialForm: ProviderCredentialForm = {
  providerId: 'anthropic',
  label: 'Anthropic workspace key',
  apiKey: '',
}

const pipelineSteps = [
  'Idea',
  'Shield scan',
  'Triage',
  'Human review',
  'Agent pool',
  'Moderator',
  'PRD',
  'Dev prompt',
]

const agentCards = [
  {
    title: 'Product Manager',
    text: 'Frames the user, problem, MVP scope, and product tradeoffs.',
  },
  {
    title: 'Critic',
    text: 'Stress-tests assumptions, weak points, risks, and unclear value.',
  },
  {
    title: 'Security Expert',
    text: 'Receives only sanitized Shield signals when risk is meaningful.',
  },
]

const agentOptions = [
  'product_manager',
  'critic',
  'moderator',
  'security_expert',
  'software_architect',
  'market_researcher',
  'mobile_ux_expert',
]

const agentCatalog: Record<string, { label: string; rationale: string }> = {
  product_manager: {
    label: 'Product Manager',
    rationale: 'Selected to frame users, value proposition, MVP scope, and product tradeoffs.',
  },
  critic: {
    label: 'Critic',
    rationale: 'Selected to challenge assumptions, weak points, and hidden execution risks.',
  },
  moderator: {
    label: 'Moderator',
    rationale: 'Required to synthesize isolated specialist output into one artifact brief.',
  },
  security_expert: {
    label: 'Security Expert',
    rationale: 'Selected when Shield or triage detects security-sensitive context.',
  },
  software_architect: {
    label: 'Software Architect',
    rationale: 'Selected for high-complexity ideas that need architecture and sequencing guidance.',
  },
  market_researcher: {
    label: 'Market Researcher',
    rationale: 'Selected when positioning, competition, pricing, or market validation is important.',
  },
  mobile_ux_expert: {
    label: 'Mobile UX Expert',
    rationale: 'Selected when the idea mentions mobile, iOS, Android, or compact review UX.',
  },
}

const domainOptions = [
  'software',
  'mobile',
  'saas',
  'ecommerce',
  'fintech',
  'healthcare',
  'education',
  'security',
  'other',
]

function formatAgent(agent: string) {
  return (agentCatalog[agent]?.label ?? agent)
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function formatArtifactTitle(artifactType: ArtifactResult['metadata']['artifactType']) {
  if (artifactType === 'prd') {
    return 'PRD'
  }

  return formatAgent(artifactType)
}

function getSeverityLabel(severity: string) {
  return severity === 'none' ? 'No risk' : severity
}

function getHighlightedIdea(rawIdea: string, findings: ShieldFinding[]) {
  const spans = findings
    .filter((finding) => finding.span)
    .map((finding) => ({
      findingId: finding.findingId,
      start: finding.span!.start,
      end: finding.span!.end,
    }))
    .sort((left, right) => left.start - right.start)

  if (spans.length === 0) {
    return rawIdea
  }

  let cursor = 0

  return (
    <>
      {spans.map((span) => {
        const before = rawIdea.slice(cursor, span.start)
        const highlighted = rawIdea.slice(span.start, span.end)
        cursor = span.end

        return (
          <Fragment key={span.findingId}>
            {before}
            <mark>{highlighted}</mark>
          </Fragment>
        )
      })}
      {rawIdea.slice(cursor)}
    </>
  )
}

function renderArtifactValue(value: unknown) {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => (
          <li key={`${String(item)}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    )
  }

  return <p>{String(value)}</p>
}

function parseSseEvents(chunk: string): PipelineStreamEvent[] {
  return chunk
    .split('\n\n')
    .map((eventBlock) => {
      const dataLine = eventBlock
        .split('\n')
        .find((line) => line.startsWith('data: '))

      if (!dataLine) {
        return null
      }

      return JSON.parse(dataLine.slice(6)) as PipelineStreamEvent
    })
    .filter((event): event is PipelineStreamEvent => Boolean(event))
}

function mapTemporalStatusToStepStatus(
  status: TemporalWorkflowStatus,
): PipelineStep['status'] {
  if (status === 'completed') {
    return 'completed'
  }

  if (status === 'running' || status === 'unknown') {
    return 'running'
  }

  return 'failed'
}

async function readSseStream(
  response: Response,
  onEvent: (event: PipelineStreamEvent) => void,
) {
  if (!response.body) {
    throw new Error('Streaming response body is not available.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const event of parseSseEvents(chunks.join('\n\n'))) {
      onEvent(event)
    }

    if (done) {
      break
    }
  }

  for (const event of parseSseEvents(buffer)) {
    onEvent(event)
  }
}

function App() {
  const [apiHealth, setApiHealth] = useState<ApiHealthState>('checking')
  const [rawIdea, setRawIdea] = useState(() => {
    return (
      localStorage.getItem(ideaStorageKey) ??
      "AI tool that turns a founder's rough concept into a validated PRD and Cursor-ready implementation prompt."
    )
  })
  const [targetAudience, setTargetAudience] = useState('Founders')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [draftRun, setDraftRun] = useState<DraftRun | null>(null)
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(() => {
    const saved = localStorage.getItem(reviewStorageKey)

    return saved ? (JSON.parse(saved) as ReviewDraft) : null
  })
  const [pipelineState, setPipelineState] = useState<PipelineState>('idle')
  const [pipelineError, setPipelineError] = useState<string | null>(null)
  const [pipelineResult, setPipelineResult] = useState<MockPipelineResult | null>(
    () => {
      const saved = localStorage.getItem(pipelineResultStorageKey)

      return saved ? (JSON.parse(saved) as MockPipelineResult) : null
    },
  )
  const [streamEvents, setStreamEvents] = useState<PipelineStreamEvent[]>([])
  const [streamedArtifacts, setStreamedArtifacts] = useState<ArtifactResult[]>([])
  const [lastStreamEventId, setLastStreamEventId] = useState<string | null>(null)
  const lastStreamEventIdRef = useRef<string | null>(null)
  const [lastStreamRunId, setLastStreamRunId] = useState<string | null>(null)
  const [runCapabilities, setRunCapabilities] =
    useState<RunCapabilitiesResponse | null>(null)
  const [authCapabilities, setAuthCapabilities] =
    useState<AuthCapabilitiesResponse | null>(null)
  const [authRollout, setAuthRollout] =
    useState<AuthRolloutResponse | null>(null)
  const [llmRollout, setLlmRollout] = useState<LlmRolloutResponse | null>(null)
  const [researchRollout, setResearchRollout] =
    useState<ResearchRolloutResponse | null>(null)
  const [temporalRollout, setTemporalRollout] =
    useState<TemporalRolloutResponse | null>(null)
  const [modelRouterRollout, setModelRouterRollout] =
    useState<ModelRouterRolloutResponse | null>(null)
  const [shieldRollout, setShieldRollout] = useState<ShieldRolloutResponse | null>(
    null,
  )
  const [providerCredentialsRollout, setProviderCredentialsRollout] =
    useState<ProviderCredentialsRolloutResponse | null>(null)
  const [observabilityRollout, setObservabilityRollout] =
    useState<ObservabilityRolloutResponse | null>(null)
  const [promptEvaluationRollout, setPromptEvaluationRollout] =
    useState<PromptEvaluationRolloutResponse | null>(null)
  const [runHistoryRollout, setRunHistoryRollout] =
    useState<RunHistoryRolloutResponse | null>(null)
  const [streamReplayRollout, setStreamReplayRollout] =
    useState<StreamReplayRolloutResponse | null>(null)
  const [idempotencyRollout, setIdempotencyRollout] =
    useState<IdempotencyRolloutResponse | null>(null)
  const [usageLimitsRollout, setUsageLimitsRollout] =
    useState<UsageLimitsRolloutResponse | null>(null)
  const [deploymentRollout, setDeploymentRollout] =
    useState<DeploymentRolloutResponse | null>(null)
  const [migrationRollout, setMigrationRollout] =
    useState<MigrationRolloutResponse | null>(null)
  const [backupRollout, setBackupRollout] =
    useState<BackupRolloutResponse | null>(null)
  const [auditTrailRollout, setAuditTrailRollout] =
    useState<AuditTrailRolloutResponse | null>(null)
  const [complianceRollout, setComplianceRollout] =
    useState<ComplianceRolloutResponse | null>(null)
  const [incidentResponseRollout, setIncidentResponseRollout] =
    useState<IncidentResponseRolloutResponse | null>(null)
  const [releaseRollout, setReleaseRollout] =
    useState<ReleaseRolloutResponse | null>(null)
  const [sloRollout, setSloRollout] = useState<SloRolloutResponse | null>(null)
  const [capacityRollout, setCapacityRollout] =
    useState<CapacityRolloutResponse | null>(null)
  const [performanceRollout, setPerformanceRollout] =
    useState<PerformanceRolloutResponse | null>(null)
  const [resilienceRollout, setResilienceRollout] =
    useState<ResilienceRolloutResponse | null>(null)
  const [availabilityRollout, setAvailabilityRollout] =
    useState<AvailabilityRolloutResponse | null>(null)
  const [reliabilityRollout, setReliabilityRollout] =
    useState<ReliabilityRolloutResponse | null>(null)
  const [stabilityRollout, setStabilityRollout] =
    useState<StabilityRolloutResponse | null>(null)
  const [consistencyRollout, setConsistencyRollout] =
    useState<ConsistencyRolloutResponse | null>(null)
  const [integrityRollout, setIntegrityRollout] =
    useState<IntegrityRolloutResponse | null>(null)
  const [durabilityRollout, setDurabilityRollout] =
    useState<DurabilityRolloutResponse | null>(null)
  const [recoverabilityRollout, setRecoverabilityRollout] =
    useState<RecoverabilityRolloutResponse | null>(null)
  const [maintainabilityRollout, setMaintainabilityRollout] =
    useState<MaintainabilityRolloutResponse | null>(null)
  const [scalabilityRollout, setScalabilityRollout] =
    useState<ScalabilityRolloutResponse | null>(null)
  const [traceabilityRollout, setTraceabilityRollout] =
    useState<TraceabilityRolloutResponse | null>(null)
  const [authSession, setAuthSession] = useState<AuthSessionResponse | null>(
    () => loadStoredAuthSession(),
  )
  const workspaceAuthHeaders = buildWorkspaceAuthHeaders(
    authCapabilities,
    authSession,
  )
  const [temporalRuntimeHealth, setTemporalRuntimeHealth] =
    useState<TemporalRuntimeHealthResponse | null>(null)
  const useTemporalWorkflowRuntime = shouldUseTemporalRuntime(
    runCapabilities?.runtime ?? null,
  )
  const approvedRunRuntimeLabel = describeApprovedRunRuntime(
    runCapabilities?.runtime ?? null,
  )
  const [activeTemporalWorkflow, setActiveTemporalWorkflow] =
    useState<TemporalRunStartResponse | null>(null)
  const [temporalRecoveryHint, setTemporalRecoveryHint] = useState<string | null>(
    null,
  )
  const [artifactHistory, setArtifactHistory] = useState<ArtifactHistoryItem[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [providerCredentials, setProviderCredentials] =
    useState<ProviderCredentialListResponse | null>(null)
  const [providerCredentialForm, setProviderCredentialForm] =
    useState<ProviderCredentialForm>(defaultProviderCredentialForm)
  const [providerCredentialError, setProviderCredentialError] = useState<
    string | null
  >(null)
  const [providerCredentialStatus, setProviderCredentialStatus] = useState<
    'idle' | 'loading' | 'saving' | 'testing'
  >('idle')
  const [billingCapabilities, setBillingCapabilities] =
    useState<BillingCapabilitiesResponse | null>(null)
  const [billingRollout, setBillingRollout] =
    useState<BillingRolloutResponse | null>(null)
  const [billingStatus, setBillingStatus] =
    useState<BillingWorkspaceStatusResponse | null>(null)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingMessage, setBillingMessage] = useState<string | null>(null)
  const [billingAction, setBillingAction] = useState<
    'idle' | 'loading' | 'upgrading' | 'portal' | 'canceling'
  >('idle')
  const [mockCustomerPortal, setMockCustomerPortal] =
    useState<MockCustomerPortalResponse | null>(null)
  const [billingWebhookEvents, setBillingWebhookEvents] = useState<
    BillingWebhookEventRecord[]
  >([])
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoiceRecord[]>(
    [],
  )
  const [billingUsageSummary, setBillingUsageSummary] =
    useState<BillingWorkspaceUsageResponse | null>(null)
  const [billingAlerts, setBillingAlerts] = useState<
    BillingWorkspaceAlertsResponse['alerts']
  >([])
  const [billingMeterUsageReports, setBillingMeterUsageReports] = useState<
    BillingMeterUsageReport[]
  >([])
  const [billingNotifications, setBillingNotifications] = useState<
    BillingNotificationRecord[]
  >([])
  const [billingAdminSummary, setBillingAdminSummary] =
    useState<BillingAdminSummaryResponse | null>(null)
  const [billingAdminAction, setBillingAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [usageAdminAction, setUsageAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [usageCapabilities, setUsageCapabilities] = useState<{
    supportsUsageAdminTools: boolean
  } | null>(null)
  const [usageAdminSummary, setUsageAdminSummary] =
    useState<UsageAdminSummaryResponse | null>(null)
  const [memberAdminSummary, setMemberAdminSummary] =
    useState<WorkspaceMemberAdminSummaryResponse | null>(null)
  const [settingsAdminSummary, setSettingsAdminSummary] =
    useState<WorkspaceSettingsAdminSummaryResponse | null>(null)
  const [modelHealthAdminSummary, setModelHealthAdminSummary] =
    useState<ModelHealthAdminSummaryResponse | null>(null)
  const [shieldReviewAdminSummary, setShieldReviewAdminSummary] =
    useState<ShieldReviewAdminSummaryResponse | null>(null)
  const [providerKeyAdminSummary, setProviderKeyAdminSummary] =
    useState<ProviderKeyAdminSummaryResponse | null>(null)
  const [observabilityAdminSummary, setObservabilityAdminSummary] =
    useState<ObservabilityAdminSummaryResponse | null>(null)
  const [promptRegressionAdminSummary, setPromptRegressionAdminSummary] =
    useState<PromptRegressionAdminSummaryResponse | null>(null)
  const [runHistoryAdminSummary, setRunHistoryAdminSummary] =
    useState<RunHistoryAdminSummaryResponse | null>(null)
  const [streamRecoveryAdminSummary, setStreamRecoveryAdminSummary] =
    useState<StreamRecoveryAdminSummaryResponse | null>(null)
  const [idempotencyAdminSummary, setIdempotencyAdminSummary] =
    useState<IdempotencyAdminSummaryResponse | null>(null)
  const [quotaAdminSummary, setQuotaAdminSummary] =
    useState<QuotaAdminSummaryResponse | null>(null)
  const [deploymentAdminSummary, setDeploymentAdminSummary] =
    useState<DeploymentAdminSummaryResponse | null>(null)
  const [migrationAdminSummary, setMigrationAdminSummary] =
    useState<MigrationAdminSummaryResponse | null>(null)
  const [backupAdminSummary, setBackupAdminSummary] =
    useState<BackupAdminSummaryResponse | null>(null)
  const [auditAdminSummary, setAuditAdminSummary] =
    useState<AuditTrailAdminSummaryResponse | null>(null)
  const [complianceAdminSummary, setComplianceAdminSummary] =
    useState<ComplianceAdminSummaryResponse | null>(null)
  const [incidentAdminSummary, setIncidentAdminSummary] =
    useState<IncidentAdminSummaryResponse | null>(null)
  const [releaseAdminSummary, setReleaseAdminSummary] =
    useState<ReleaseAdminSummaryResponse | null>(null)
  const [sloAdminSummary, setSloAdminSummary] =
    useState<SloAdminSummaryResponse | null>(null)
  const [capacityAdminSummary, setCapacityAdminSummary] =
    useState<CapacityAdminSummaryResponse | null>(null)
  const [performanceAdminSummary, setPerformanceAdminSummary] =
    useState<PerformanceAdminSummaryResponse | null>(null)
  const [resilienceAdminSummary, setResilienceAdminSummary] =
    useState<ResilienceAdminSummaryResponse | null>(null)
  const [availabilityAdminSummary, setAvailabilityAdminSummary] =
    useState<AvailabilityAdminSummaryResponse | null>(null)
  const [reliabilityAdminSummary, setReliabilityAdminSummary] =
    useState<ReliabilityAdminSummaryResponse | null>(null)
  const [stabilityAdminSummary, setStabilityAdminSummary] =
    useState<StabilityAdminSummaryResponse | null>(null)
  const [consistencyAdminSummary, setConsistencyAdminSummary] =
    useState<ConsistencyAdminSummaryResponse | null>(null)
  const [integrityAdminSummary, setIntegrityAdminSummary] =
    useState<IntegrityAdminSummaryResponse | null>(null)
  const [durabilityAdminSummary, setDurabilityAdminSummary] =
    useState<DurabilityAdminSummaryResponse | null>(null)
  const [recoverabilityAdminSummary, setRecoverabilityAdminSummary] =
    useState<RecoverabilityAdminSummaryResponse | null>(null)
  const [maintainabilityAdminSummary, setMaintainabilityAdminSummary] =
    useState<MaintainabilityAdminSummaryResponse | null>(null)
  const [scalabilityAdminSummary, setScalabilityAdminSummary] =
    useState<ScalabilityAdminSummaryResponse | null>(null)
  const [traceabilityAdminSummary, setTraceabilityAdminSummary] =
    useState<TraceabilityAdminSummaryResponse | null>(null)
  const [settingsAdminAction, setSettingsAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [modelHealthAdminAction, setModelHealthAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [shieldReviewAdminAction, setShieldReviewAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [providerKeyAdminAction, setProviderKeyAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [observabilityAdminAction, setObservabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [promptRegressionAdminAction, setPromptRegressionAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [runHistoryAdminAction, setRunHistoryAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [streamRecoveryAdminAction, setStreamRecoveryAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [idempotencyAdminAction, setIdempotencyAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [quotaAdminAction, setQuotaAdminAction] = useState<'idle' | 'running'>(
    'idle',
  )
  const [deploymentAdminAction, setDeploymentAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [migrationAdminAction, setMigrationAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [backupAdminAction, setBackupAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [auditAdminAction, setAuditAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [complianceAdminAction, setComplianceAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [incidentAdminAction, setIncidentAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [releaseAdminAction, setReleaseAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [sloAdminAction, setSloAdminAction] = useState<'idle' | 'running'>(
    'idle',
  )
  const [capacityAdminAction, setCapacityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [performanceAdminAction, setPerformanceAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [resilienceAdminAction, setResilienceAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [availabilityAdminAction, setAvailabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [reliabilityAdminAction, setReliabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [stabilityAdminAction, setStabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [consistencyAdminAction, setConsistencyAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [integrityAdminAction, setIntegrityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [durabilityAdminAction, setDurabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [recoverabilityAdminAction, setRecoverabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [maintainabilityAdminAction, setMaintainabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [scalabilityAdminAction, setScalabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [traceabilityAdminAction, setTraceabilityAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [workspaceNameDraft, setWorkspaceNameDraft] = useState('')
  const [memberAdminAction, setMemberAdminAction] = useState<
    'idle' | 'running'
  >('idle')
  const [newMemberForm, setNewMemberForm] = useState({
    userId: '',
    role: 'member' as 'owner' | 'admin' | 'member' | 'viewer',
    email: '',
  })
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null)
  const [activeArtifactType, setActiveArtifactType] =
    useState<ArtifactResult['metadata']['artifactType']>('executive_summary')

  useEffect(() => {
    if (!useTemporalWorkflowRuntime) {
      return
    }

    const persisted = loadPersistedTemporalWorkflow()

    if (!persisted) {
      return
    }

    setActiveTemporalWorkflow(toTemporalRunStartResponse(persisted))

    if (persisted.lastStreamEventId) {
      lastStreamEventIdRef.current = persisted.lastStreamEventId
      setLastStreamEventId(persisted.lastStreamEventId)
      setLastStreamRunId(persisted.runId)
    }
  }, [useTemporalWorkflowRuntime])

  useEffect(() => {
    if (!useTemporalWorkflowRuntime || !activeTemporalWorkflow) {
      return
    }

    if (isTemporalTerminalStatus(activeTemporalWorkflow.status)) {
      if (activeTemporalWorkflow.status === 'completed') {
        savePersistedTemporalWorkflow(null)
      }

      return
    }

    savePersistedTemporalWorkflow({
      ...activeTemporalWorkflow,
      lastStreamEventId,
      persistedAt: new Date().toISOString(),
    })
  }, [activeTemporalWorkflow, lastStreamEventId, useTemporalWorkflowRuntime])

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/health`, {
      signal: controller.signal,
    })
      .then((response) => {
        setApiHealth(response.ok ? 'online' : 'offline')
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiHealth('offline')
        }
      })

    fetch(`${apiBaseUrl}/auth/capabilities`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((capabilities) => {
        if (capabilities && !controller.signal.aborted) {
          setAuthCapabilities(capabilities as AuthCapabilitiesResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthCapabilities(null)
        }
      })

    fetchAuthRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setAuthRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthRollout(null)
        }
      })

    fetchLlmRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setLlmRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLlmRollout(null)
        }
      })

    fetchResearchRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setResearchRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResearchRollout(null)
        }
      })

    fetchTemporalRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setTemporalRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTemporalRollout(null)
        }
      })

    fetchModelRouterRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setModelRouterRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setModelRouterRollout(null)
        }
      })

    fetchShieldRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setShieldRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setShieldRollout(null)
        }
      })

    fetchProviderCredentialsRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setProviderCredentialsRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProviderCredentialsRollout(null)
        }
      })

    fetchObservabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setObservabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setObservabilityRollout(null)
        }
      })

    fetchPromptEvaluationRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setPromptEvaluationRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPromptEvaluationRollout(null)
        }
      })

    fetchRunHistoryRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setRunHistoryRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRunHistoryRollout(null)
        }
      })

    fetchStreamReplayRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setStreamReplayRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStreamReplayRollout(null)
        }
      })

    fetchIdempotencyRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setIdempotencyRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIdempotencyRollout(null)
        }
      })

    fetchUsageLimitsRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setUsageLimitsRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUsageLimitsRollout(null)
        }
      })

    fetchDeploymentRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setDeploymentRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDeploymentRollout(null)
        }
      })

    fetchMigrationRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setMigrationRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMigrationRollout(null)
        }
      })

    fetchBackupRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setBackupRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBackupRollout(null)
        }
      })

    fetchAuditTrailRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setAuditTrailRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuditTrailRollout(null)
        }
      })

    fetchComplianceRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setComplianceRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setComplianceRollout(null)
        }
      })

    fetchIncidentResponseRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setIncidentResponseRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIncidentResponseRollout(null)
        }
      })

    fetchReleaseRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setReleaseRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setReleaseRollout(null)
        }
      })

    fetchSloRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setSloRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSloRollout(null)
        }
      })

    fetchCapacityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setCapacityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCapacityRollout(null)
        }
      })

    fetchPerformanceRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setPerformanceRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPerformanceRollout(null)
        }
      })

    fetchResilienceRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setResilienceRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResilienceRollout(null)
        }
      })

    fetchAvailabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setAvailabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAvailabilityRollout(null)
        }
      })

    fetchReliabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setReliabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setReliabilityRollout(null)
        }
      })

    fetchStabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setStabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStabilityRollout(null)
        }
      })

    fetchConsistencyRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setConsistencyRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setConsistencyRollout(null)
        }
      })

    fetchIntegrityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setIntegrityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIntegrityRollout(null)
        }
      })

    fetchDurabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setDurabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDurabilityRollout(null)
        }
      })

    fetchRecoverabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setRecoverabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRecoverabilityRollout(null)
        }
      })

    fetchMaintainabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setMaintainabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMaintainabilityRollout(null)
        }
      })

    fetchScalabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setScalabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setScalabilityRollout(null)
        }
      })

    fetchTraceabilityRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setTraceabilityRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTraceabilityRollout(null)
        }
      })

    fetchUsageCapabilities(apiBaseUrl)
      .then((capabilities) => {
        if (!controller.signal.aborted) {
          setUsageCapabilities(capabilities)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUsageCapabilities(null)
        }
      })

    fetch(`${apiBaseUrl}/runs/capabilities`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((capabilities) => {
        if (capabilities && !controller.signal.aborted) {
          setRunCapabilities(capabilities as RunCapabilitiesResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRunCapabilities(null)
        }
      })

    fetchBillingCapabilities(apiBaseUrl)
      .then((capabilities) => {
        if (!controller.signal.aborted) {
          setBillingCapabilities(capabilities)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBillingCapabilities(null)
        }
      })

    fetchBillingRollout(apiBaseUrl)
      .then((rollout) => {
        if (!controller.signal.aborted) {
          setBillingRollout(rollout)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBillingRollout(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (authCapabilities?.provider !== 'session') {
      return
    }

    const storedSession = loadStoredAuthSession()

    if (storedSession) {
      setAuthSession(storedSession)
      return
    }

    const controller = new AbortController()

    fetch(`${apiBaseUrl}/auth/session`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...buildBootstrapAuthHeaders(authCapabilities),
      },
      body: JSON.stringify({
        workspaceId: 'local_workspace',
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (session && !controller.signal.aborted) {
          const nextSession = session as AuthSessionResponse
          saveStoredAuthSession(nextSession)
          setAuthSession(nextSession)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthSession(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [authCapabilities])

  useEffect(() => {
    if (!useTemporalWorkflowRuntime) {
      setTemporalRuntimeHealth(null)
      return
    }

    const controller = new AbortController()

    fetch(`${apiBaseUrl}/runs/temporal/health`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((health) => {
        if (health && !controller.signal.aborted) {
          setTemporalRuntimeHealth(health as TemporalRuntimeHealthResponse)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTemporalRuntimeHealth(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [useTemporalWorkflowRuntime])

  useEffect(() => {
    localStorage.setItem(ideaStorageKey, rawIdea)
  }, [rawIdea])

  useEffect(() => {
    if (reviewDraft) {
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviewDraft))
    }
  }, [reviewDraft])

  useEffect(() => {
    if (pipelineResult) {
      localStorage.setItem(
        pipelineResultStorageKey,
        JSON.stringify(pipelineResult),
      )
    }
  }, [pipelineResult])

  useEffect(() => {
    setActiveFindingId(draftRun?.shieldScan.findings[0]?.findingId ?? null)
  }, [draftRun])

  useEffect(() => {
    void handleLoadProviderCredentials()
  }, [])

  useEffect(() => {
    void handleLoadBillingStatus()
  }, [authCapabilities, authSession])

  useEffect(() => {
    const returnHint = readBillingReturnHint()

    if (!returnHint) {
      return
    }

    if (returnHint === 'success') {
      setBillingMessage('Checkout completed. Workspace billing status refreshed.')
    } else if (returnHint === 'portal') {
      setBillingMessage('Returned from customer portal. Billing status refreshed.')
    } else {
      setBillingMessage('Checkout canceled. No billing changes were applied.')
    }

    clearBillingReturnHint()
    setMockCustomerPortal(null)
    void handleLoadBillingStatus()
  }, [])

  useEffect(() => {
    if (pipelineResult?.artifacts[0]) {
      setActiveArtifactType(pipelineResult.artifacts[0].metadata.artifactType)
    }
  }, [pipelineResult])

  async function handleCreateDraftRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState('submitting')
    setSubmitError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/runs/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
        },
        body: JSON.stringify({
          workspaceId: 'local_workspace',
          idempotencyKey: globalThis.crypto.randomUUID(),
          idea: {
            rawIdea,
            targetAudience,
            strategicGoals: ['Create build-ready planning artifacts'],
            technicalPreferences: ['TypeScript', 'Vite', 'NestJS'],
            constraints: ['MVP first', 'No chat loops'],
            references: [],
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const nextDraftRun = (await response.json()) as DraftRun
      setDraftRun(nextDraftRun)
      setReviewDraft({
        triage: nextDraftRun.triage,
        selectedAgents: nextDraftRun.selectedAgents,
      })
      setPipelineResult(null)
      localStorage.removeItem(pipelineResultStorageKey)
      setStreamEvents([])
      setStreamedArtifacts([])
      setPipelineState('idle')
      setSubmitState('success')
    } catch (error) {
      setSubmitState('error')
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create draft run.',
      )
    }
  }

  function updateReviewTriage<Key extends keyof DraftRun['triage']>(
    key: Key,
    value: DraftRun['triage'][Key],
  ) {
    setReviewDraft((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        triage: {
          ...current.triage,
          [key]: value,
        },
      }
    })
  }

  function toggleAgent(agent: string) {
    setReviewDraft((current) => {
      if (!current) {
        return current
      }

      const selectedAgents = current.selectedAgents.includes(agent)
        ? current.selectedAgents.filter((selectedAgent) => selectedAgent !== agent)
        : [...current.selectedAgents, agent]

      return {
        ...current,
        selectedAgents,
      }
    })
  }

  function createApprovedRunPayload() {
    if (!draftRun || !reviewDraft) {
      return null
    }

    return {
      draftRun,
      approvedTriage: reviewDraft.triage,
      selectedAgents: reviewDraft.selectedAgents,
    }
  }

  async function handleExecuteApprovedRun() {
    if (useTemporalWorkflowRuntime) {
      await handleExecuteTemporalWorkflow()
      return
    }

    await handleExecuteStreamedPipeline()
  }

  async function handleExecuteStreamedPipeline() {
    if (!draftRun || !reviewDraft) {
      return
    }

    const canReplayStream =
      pipelineState === 'error' &&
      lastStreamRunId === draftRun.runId &&
      lastStreamEventId

    setPipelineState('running')
    setPipelineError(null)
    setPipelineResult(null)
    setLastStreamRunId(draftRun.runId)

    if (!canReplayStream) {
      setStreamEvents([])
      setStreamedArtifacts([])
      lastStreamEventIdRef.current = null
      setLastStreamEventId(null)
      setActiveTemporalWorkflow(null)
    }

    try {
      const payload = createApprovedRunPayload()

      if (!payload) {
        return
      }

      const response = await fetch(`${apiBaseUrl}/runs/mock-pipeline/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
          ...(canReplayStream ? { 'Last-Event-ID': lastStreamEventId } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await readSseStream(response, handlePipelineStreamEvent)
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to execute prompt-driven pipeline.',
      )
    }
  }

  async function handleExecuteTemporalWorkflow() {
    if (!draftRun) {
      return
    }

    const recoverableWorkflow =
      activeTemporalWorkflow ??
      (() => {
        const persisted = loadPersistedTemporalWorkflow()

        return persisted?.runId === draftRun.runId
          ? toTemporalRunStartResponse(persisted)
          : null
      })()

    if (
      canResumeTemporalWorkflow({
        runId: draftRun.runId,
        workflow: recoverableWorkflow,
      }) &&
      recoverableWorkflow
    ) {
      await handleResumeTemporalWorkflow(recoverableWorkflow)
      return
    }

    setPipelineState('running')
    setPipelineError(null)
    setPipelineResult(null)
    setTemporalRecoveryHint(null)
    setActiveTemporalWorkflow(null)
    setLastStreamRunId(draftRun.runId)
    setStreamEvents([])
    setStreamedArtifacts([])
    lastStreamEventIdRef.current = null
    setLastStreamEventId(null)
    savePersistedTemporalWorkflow(null)

    try {
      const payload = createApprovedRunPayload()

      if (!payload) {
        return
      }

      const startResponse = await fetch(`${apiBaseUrl}/runs/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...workspaceAuthHeaders,
        },
        body: JSON.stringify(payload),
      })

      if (!startResponse.ok) {
        throw new Error(`API returned ${startResponse.status}`)
      }

      const workflow = (await startResponse.json()) as TemporalRunStartResponse
      setActiveTemporalWorkflow(workflow)

      await Promise.all([
        observeTemporalWorkflow(workflow.workflowId),
        pollTemporalWorkflowStatus(workflow),
      ])
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to start Temporal workflow.',
      )
    }
  }

  async function handleResumeTemporalWorkflow(workflow: TemporalRunStartResponse) {
    setPipelineState('running')
    setPipelineError(null)
    setTemporalRecoveryHint(null)
    setLastStreamRunId(workflow.runId)
    setActiveTemporalWorkflow(workflow)

    try {
      const recoverResponse = await fetch(
        `${apiBaseUrl}/runs/workflows/${workflow.workflowId}/recover`,
        {
          method: 'POST',
          headers: workspaceAuthHeaders,
        },
      )

      if (!recoverResponse.ok) {
        throw new Error(`API returned ${recoverResponse.status}`)
      }

      const recovery =
        (await recoverResponse.json()) as TemporalWorkflowRecoveryResponse
      const resumedWorkflow = toTemporalRunStartResponse(recovery.workflow)

      setTemporalRecoveryHint(recovery.recoveryHint)
      setActiveTemporalWorkflow(resumedWorkflow)

      const persistedWorkflow = loadPersistedTemporalWorkflow()
      const replayEventId =
        persistedWorkflow?.runId === workflow.runId
          ? persistedWorkflow.lastStreamEventId ?? lastStreamEventId
          : lastStreamEventId

      await Promise.all([
        observeTemporalWorkflow(resumedWorkflow.workflowId, {
          afterEventId: replayEventId,
        }),
        pollTemporalWorkflowStatus(resumedWorkflow),
      ])
    } catch (error) {
      setPipelineState('error')
      setPipelineError(
        error instanceof Error
          ? error.message
          : 'Failed to resume Temporal workflow observation.',
      )
    }
  }

  async function observeTemporalWorkflow(
    workflowId: string,
    options?: { afterEventId?: string | null },
  ) {
    const headers: Record<string, string> = {
      ...workspaceAuthHeaders,
    }
    const afterEventId = options?.afterEventId ?? lastStreamEventIdRef.current

    if (afterEventId) {
      headers['Last-Event-ID'] = afterEventId
    }

    const response = await fetch(`${apiBaseUrl}/runs/workflows/${workflowId}/stream`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    await readSseStream(response, handlePipelineStreamEvent)
  }

  async function pollTemporalWorkflowStatus(workflow: TemporalRunStartResponse) {
    let latestStatus: TemporalWorkflowStatus = workflow.status
    const deadline = Date.now() + temporalObservationTimeoutMs
    let attempt = 0

    while (!isTemporalTerminalStatus(latestStatus) && Date.now() < deadline) {
      await sleep(attempt === 0 ? temporalInitialPollDelayMs : temporalPollIntervalMs)
      attempt += 1

      const statusResponse = await fetch(
        `${apiBaseUrl}/runs/workflows/${workflow.workflowId}/status`,
        {
          headers: workspaceAuthHeaders,
        },
      )

      if (!statusResponse.ok) {
        throw new Error(`API returned ${statusResponse.status}`)
      }

      const status = (await statusResponse.json()) as TemporalRunStatusResponse
      latestStatus = status.status
      setActiveTemporalWorkflow((current) =>
        current
          ? {
              ...current,
              temporalRunId: status.temporalRunId ?? current.temporalRunId,
              status: status.status,
            }
          : current,
      )
    }

    if (latestStatus === 'completed') {
      savePersistedTemporalWorkflow(null)
      const history = await handleLoadArtifactHistory()
      const runArtifacts = history
        .filter((artifact) => artifact.runId === workflow.runId)
        .map((artifact) => ({
          metadata: artifact.metadata,
          artifact: artifact.artifact,
        }))

      setStreamedArtifacts(runArtifacts)
      if (runArtifacts[0]) {
        setActiveArtifactType(runArtifacts[0].metadata.artifactType)
      }
      setPipelineState('completed')
      return
    }

    if (isTemporalTerminalStatus(latestStatus)) {
      throw new Error(formatTemporalFailureMessage(latestStatus))
    }

    setPipelineState('error')
    setPipelineError(createTemporalObservationTimeoutMessage(temporalObservationTimeoutMs))
  }

  async function handleLoadArtifactHistory() {
    setHistoryError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/runs/artifacts/history`, {
        headers: workspaceAuthHeaders,
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const history = (await response.json()) as ArtifactHistoryResponse
      setArtifactHistory(history.artifacts)

      return history.artifacts
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : 'Failed to load artifact history.',
      )

      return []
    }
  }

  async function handleExportMarkdown(artifactId: string) {
    setHistoryError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/runs/artifacts/${artifactId}/export/markdown`,
        {
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const markdown = await response.text()
      const blob = new Blob([markdown], {
        type: 'text/markdown;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${artifactId}.md`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : 'Failed to export Markdown.',
      )
    }
  }

  async function handleLoadBillingStatus() {
    setBillingAction('loading')
    setBillingError(null)

    try {
      const status = await fetchBillingWorkspaceStatus(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingStatus(status)

      const events = await fetchBillingWebhookEvents(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingWebhookEvents(events.events)

      const invoices = await fetchBillingInvoices(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingInvoices(invoices.invoices)

      const usage = await fetchBillingUsageSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingUsageSummary(usage)

      const alerts = await fetchBillingAlerts(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingAlerts(alerts.alerts)

      const meterUsage = await fetchBillingMeterUsageReports(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingMeterUsageReports(meterUsage.reports)

      const notifications = await fetchBillingNotifications(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingNotifications(notifications.notifications)

      const adminSummary = await fetchBillingAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingAdminSummary(adminSummary)

      const usageAdmin = await fetchUsageAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setUsageAdminSummary(usageAdmin)

      const membersAdmin = await fetchWorkspaceMemberAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setMemberAdminSummary(membersAdmin)

      const settingsAdmin = await fetchWorkspaceSettingsAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setSettingsAdminSummary(settingsAdmin)
      setWorkspaceNameDraft(settingsAdmin?.settings.name ?? '')

      const modelHealthAdmin = await fetchModelHealthAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setModelHealthAdminSummary(modelHealthAdmin)

      const shieldReviewAdmin = await fetchShieldReviewAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setShieldReviewAdminSummary(shieldReviewAdmin)

      const providerKeyAdmin = await fetchProviderKeyAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setProviderKeyAdminSummary(providerKeyAdmin)

      const observabilityAdmin = await fetchObservabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setObservabilityAdminSummary(observabilityAdmin)

      const promptRegressionAdmin = await fetchPromptRegressionAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setPromptRegressionAdminSummary(promptRegressionAdmin)

      const runHistoryAdmin = await fetchRunHistoryAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setRunHistoryAdminSummary(runHistoryAdmin)

      const streamRecoveryAdmin = await fetchStreamRecoveryAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setStreamRecoveryAdminSummary(streamRecoveryAdmin)

      const idempotencyAdmin = await fetchIdempotencyAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setIdempotencyAdminSummary(idempotencyAdmin)

      const quotaAdmin = await fetchQuotaAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setQuotaAdminSummary(quotaAdmin)

      const deploymentAdmin = await fetchDeploymentAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setDeploymentAdminSummary(deploymentAdmin)

      const migrationAdmin = await fetchMigrationAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setMigrationAdminSummary(migrationAdmin)

      const backupAdmin = await fetchBackupAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBackupAdminSummary(backupAdmin)

      const auditAdmin = await fetchAuditAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setAuditAdminSummary(auditAdmin)

      const complianceAdmin = await fetchComplianceAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setComplianceAdminSummary(complianceAdmin)

      const incidentAdmin = await fetchIncidentAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setIncidentAdminSummary(incidentAdmin)

      const releaseAdmin = await fetchReleaseAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setReleaseAdminSummary(releaseAdmin)

      const sloAdmin = await fetchSloAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setSloAdminSummary(sloAdmin)

      const capacityAdmin = await fetchCapacityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setCapacityAdminSummary(capacityAdmin)

      const performanceAdmin = await fetchPerformanceAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setPerformanceAdminSummary(performanceAdmin)

      const resilienceAdmin = await fetchResilienceAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setResilienceAdminSummary(resilienceAdmin)

      const availabilityAdmin = await fetchAvailabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setAvailabilityAdminSummary(availabilityAdmin)

      const reliabilityAdmin = await fetchReliabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setReliabilityAdminSummary(reliabilityAdmin)

      const stabilityAdmin = await fetchStabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setStabilityAdminSummary(stabilityAdmin)

      const consistencyAdmin = await fetchConsistencyAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setConsistencyAdminSummary(consistencyAdmin)

      const integrityAdmin = await fetchIntegrityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setIntegrityAdminSummary(integrityAdmin)

      const durabilityAdmin = await fetchDurabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setDurabilityAdminSummary(durabilityAdmin)

      const recoverabilityAdmin = await fetchRecoverabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setRecoverabilityAdminSummary(recoverabilityAdmin)

      const maintainabilityAdmin = await fetchMaintainabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setMaintainabilityAdminSummary(maintainabilityAdmin)

      const scalabilityAdmin = await fetchScalabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setScalabilityAdminSummary(scalabilityAdmin)

      const traceabilityAdmin = await fetchTraceabilityAdminSummary(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setTraceabilityAdminSummary(traceabilityAdmin)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to load workspace billing status.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleBillingAdminAction(
    action: 'sync_notifications' | 'reset_mock_billing',
  ) {
    setBillingAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeBillingAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        action,
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run billing admin action.',
      )
    } finally {
      setBillingAdminAction('idle')
    }
  }

  async function handleUsageAdminAction(action: 'reset_daily_usage') {
    setUsageAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeUsageAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        action,
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run usage admin action.',
      )
    } finally {
      setUsageAdminAction('idle')
    }
  }

  async function handleMemberAdminAction(input: {
    action: 'update_member_role' | 'remove_member' | 'add_member'
    userId: string
    role?: 'owner' | 'admin' | 'member' | 'viewer'
    email?: string
  }) {
    setMemberAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeWorkspaceMemberAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        input,
      )
      setBillingMessage(result.message)
      if (input.action === 'add_member') {
        setNewMemberForm({
          userId: '',
          role: 'member',
          email: '',
        })
      }
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run workspace member admin action.',
      )
    } finally {
      setMemberAdminAction('idle')
    }
  }

  async function handleSettingsAdminAction(input: {
    action: 'update_workspace_name' | 'reset_workspace_name'
    name?: string
  }) {
    setSettingsAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeWorkspaceSettingsAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        input,
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run workspace settings admin action.',
      )
    } finally {
      setSettingsAdminAction('idle')
    }
  }

  async function handleModelHealthAdminAction(modelId: string) {
    setModelHealthAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeModelHealthAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        {
          action: 'recover_model',
          modelId,
        },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run model health admin action.',
      )
    } finally {
      setModelHealthAdminAction('idle')
    }
  }

  async function handleShieldReviewAdminAction(
    action: 'rerun_review_summary',
  ) {
    setShieldReviewAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeShieldReviewAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run Shield review admin action.',
      )
    } finally {
      setShieldReviewAdminAction('idle')
    }
  }

  async function handleProviderKeyAdminAction(
    action: 'test_all_credentials' | 'retest_failed_credentials',
  ) {
    setProviderKeyAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeProviderKeyAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      await handleLoadProviderCredentials()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run provider key admin action.',
      )
    } finally {
      setProviderKeyAdminAction('idle')
    }
  }

  async function handleObservabilityAdminAction(
    action: 'refresh_event_summary' | 'clear_observability_buffer',
  ) {
    setObservabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeObservabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run observability admin action.',
      )
    } finally {
      setObservabilityAdminAction('idle')
    }
  }

  async function handlePromptRegressionAdminAction(
    action: 'rerun_prompt_regression',
  ) {
    setPromptRegressionAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executePromptRegressionAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchPromptEvaluationRollout(apiBaseUrl)
      setPromptEvaluationRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run prompt regression admin action.',
      )
    } finally {
      setPromptRegressionAdminAction('idle')
    }
  }

  async function handleRunHistoryAdminAction(
    action: 'refresh_run_history_summary',
  ) {
    setRunHistoryAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeRunHistoryAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchRunHistoryRollout(apiBaseUrl)
      setRunHistoryRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run run history admin action.',
      )
    } finally {
      setRunHistoryAdminAction('idle')
    }
  }

  async function handleStreamRecoveryAdminAction(
    action: 'refresh_stream_recovery_summary' | 'clear_workspace_stream_buffers',
  ) {
    setStreamRecoveryAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeStreamRecoveryAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchStreamReplayRollout(apiBaseUrl)
      setStreamReplayRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run stream recovery admin action.',
      )
    } finally {
      setStreamRecoveryAdminAction('idle')
    }
  }

  async function handleIdempotencyAdminAction(
    action:
      | 'refresh_idempotency_summary'
      | 'clear_workspace_idempotency_reservations',
  ) {
    setIdempotencyAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeIdempotencyAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchIdempotencyRollout(apiBaseUrl)
      setIdempotencyRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run idempotency admin action.',
      )
    } finally {
      setIdempotencyAdminAction('idle')
    }
  }

  async function handleQuotaAdminAction(action: 'refresh_quota_summary') {
    setQuotaAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeQuotaAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchUsageLimitsRollout(apiBaseUrl)
      setUsageLimitsRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run quota admin action.',
      )
    } finally {
      setQuotaAdminAction('idle')
    }
  }

  async function handleDeploymentAdminAction(action: 'refresh_deployment_summary') {
    setDeploymentAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeDeploymentAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchDeploymentRollout(apiBaseUrl)
      setDeploymentRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run deployment admin action.',
      )
    } finally {
      setDeploymentAdminAction('idle')
    }
  }

  async function handleMigrationAdminAction(action: 'refresh_migration_summary') {
    setMigrationAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeMigrationAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchMigrationRollout(apiBaseUrl)
      setMigrationRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run migration admin action.',
      )
    } finally {
      setMigrationAdminAction('idle')
    }
  }

  async function handleBackupAdminAction(action: 'refresh_backup_summary') {
    setBackupAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeBackupAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchBackupRollout(apiBaseUrl)
      setBackupRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run backup admin action.',
      )
    } finally {
      setBackupAdminAction('idle')
    }
  }

  async function handleAuditAdminAction(action: 'refresh_audit_summary') {
    setAuditAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeAuditAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchAuditTrailRollout(apiBaseUrl)
      setAuditTrailRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run audit admin action.',
      )
    } finally {
      setAuditAdminAction('idle')
    }
  }

  async function handleComplianceAdminAction(action: 'refresh_compliance_summary') {
    setComplianceAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeComplianceAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchComplianceRollout(apiBaseUrl)
      setComplianceRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run compliance admin action.',
      )
    } finally {
      setComplianceAdminAction('idle')
    }
  }

  async function handleIncidentAdminAction(action: 'refresh_incident_summary') {
    setIncidentAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeIncidentAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchIncidentResponseRollout(apiBaseUrl)
      setIncidentResponseRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run incident admin action.',
      )
    } finally {
      setIncidentAdminAction('idle')
    }
  }

  async function handleReleaseAdminAction(action: 'refresh_release_summary') {
    setReleaseAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeReleaseAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchReleaseRollout(apiBaseUrl)
      setReleaseRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run release admin action.',
      )
    } finally {
      setReleaseAdminAction('idle')
    }
  }

  async function handleSloAdminAction(action: 'refresh_slo_summary') {
    setSloAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeSloAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchSloRollout(apiBaseUrl)
      setSloRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run SLO admin action.',
      )
    } finally {
      setSloAdminAction('idle')
    }
  }

  async function handleCapacityAdminAction(action: 'refresh_capacity_summary') {
    setCapacityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeCapacityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchCapacityRollout(apiBaseUrl)
      setCapacityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run capacity admin action.',
      )
    } finally {
      setCapacityAdminAction('idle')
    }
  }

  async function handlePerformanceAdminAction(
    action: 'refresh_performance_summary',
  ) {
    setPerformanceAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executePerformanceAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchPerformanceRollout(apiBaseUrl)
      setPerformanceRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run performance admin action.',
      )
    } finally {
      setPerformanceAdminAction('idle')
    }
  }

  async function handleResilienceAdminAction(
    action: 'refresh_resilience_summary',
  ) {
    setResilienceAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeResilienceAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchResilienceRollout(apiBaseUrl)
      setResilienceRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run resilience admin action.',
      )
    } finally {
      setResilienceAdminAction('idle')
    }
  }

  async function handleAvailabilityAdminAction(
    action: 'refresh_availability_summary',
  ) {
    setAvailabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeAvailabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchAvailabilityRollout(apiBaseUrl)
      setAvailabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run availability admin action.',
      )
    } finally {
      setAvailabilityAdminAction('idle')
    }
  }

  async function handleReliabilityAdminAction(
    action: 'refresh_reliability_summary',
  ) {
    setReliabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeReliabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchReliabilityRollout(apiBaseUrl)
      setReliabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run reliability admin action.',
      )
    } finally {
      setReliabilityAdminAction('idle')
    }
  }

  async function handleStabilityAdminAction(
    action: 'refresh_stability_summary',
  ) {
    setStabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeStabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchStabilityRollout(apiBaseUrl)
      setStabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run stability admin action.',
      )
    } finally {
      setStabilityAdminAction('idle')
    }
  }

  async function handleConsistencyAdminAction(
    action: 'refresh_consistency_summary',
  ) {
    setConsistencyAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeConsistencyAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchConsistencyRollout(apiBaseUrl)
      setConsistencyRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run consistency admin action.',
      )
    } finally {
      setConsistencyAdminAction('idle')
    }
  }

  async function handleIntegrityAdminAction(
    action: 'refresh_integrity_summary',
  ) {
    setIntegrityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeIntegrityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchIntegrityRollout(apiBaseUrl)
      setIntegrityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run integrity admin action.',
      )
    } finally {
      setIntegrityAdminAction('idle')
    }
  }

  async function handleDurabilityAdminAction(
    action: 'refresh_durability_summary',
  ) {
    setDurabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeDurabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchDurabilityRollout(apiBaseUrl)
      setDurabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run durability admin action.',
      )
    } finally {
      setDurabilityAdminAction('idle')
    }
  }

  async function handleRecoverabilityAdminAction(
    action: 'refresh_recoverability_summary',
  ) {
    setRecoverabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeRecoverabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchRecoverabilityRollout(apiBaseUrl)
      setRecoverabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run recoverability admin action.',
      )
    } finally {
      setRecoverabilityAdminAction('idle')
    }
  }

  async function handleMaintainabilityAdminAction(
    action: 'refresh_maintainability_summary',
  ) {
    setMaintainabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeMaintainabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchMaintainabilityRollout(apiBaseUrl)
      setMaintainabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run maintainability admin action.',
      )
    } finally {
      setMaintainabilityAdminAction('idle')
    }
  }

  async function handleScalabilityAdminAction(
    action: 'refresh_scalability_summary',
  ) {
    setScalabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeScalabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchScalabilityRollout(apiBaseUrl)
      setScalabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run scalability admin action.',
      )
    } finally {
      setScalabilityAdminAction('idle')
    }
  }

  async function handleTraceabilityAdminAction(
    action: 'refresh_traceability_summary',
  ) {
    setTraceabilityAdminAction('running')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const result = await executeTraceabilityAdminAction(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        { action },
      )
      setBillingMessage(result.message)
      await handleLoadBillingStatus()
      const rollout = await fetchTraceabilityRollout(apiBaseUrl)
      setTraceabilityRollout(rollout)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to run traceability admin action.',
      )
    } finally {
      setTraceabilityAdminAction('idle')
    }
  }

  async function handleExportRunHistory(format: 'csv' | 'json') {
    setBillingError(null)

    try {
      await downloadRunHistoryExport(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        format,
      )
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to export run history.',
      )
    }
  }

  async function handleExportBillingInvoices(format: 'csv' | 'json') {
    setBillingError(null)

    try {
      await downloadBillingInvoiceExport(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        format,
      )
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to export billing invoices.',
      )
    }
  }

  async function handleExportWorkspaceAudit(format: 'csv' | 'json') {
    setBillingError(null)

    try {
      await downloadWorkspaceAuditExport(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
        format,
      )
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to export workspace audit data.',
      )
    }
  }

  async function handleUpgradeBillingTier(paidTier: CheckoutPaidTier) {
    setBillingAction('upgrading')
    setBillingError(null)
    setBillingMessage(null)
    setMockCustomerPortal(null)

    try {
      const session = await createBillingCheckoutSession(
        apiBaseUrl,
        defaultWorkspaceId,
        paidTier,
        workspaceAuthHeaders,
      )

      if (billingCapabilities?.adapter === 'mock') {
        const completed = await completeMockBillingCheckout(session.checkoutUrl)
        setBillingStatus(completed)
        setBillingMessage(
          `Mock checkout completed. Workspace upgraded to ${formatPaidTier(paidTier)}.`,
        )
        return
      }

      window.location.assign(session.checkoutUrl)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to start billing checkout.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleOpenCustomerPortal() {
    setBillingAction('portal')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const session = await createCustomerPortalSession(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )

      if (billingCapabilities?.adapter === 'mock') {
        const portal = await fetchMockCustomerPortal(session.portalUrl)
        setMockCustomerPortal(portal)
        return
      }

      window.location.assign(session.portalUrl)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to open customer portal.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleCancelMockSubscription() {
    setBillingAction('canceling')
    setBillingError(null)
    setBillingMessage(null)

    try {
      const status = await cancelMockCustomerPortalSubscription(
        apiBaseUrl,
        defaultWorkspaceId,
        workspaceAuthHeaders,
      )
      setBillingStatus(status)
      setMockCustomerPortal(null)
      setBillingMessage('Subscription canceled. Workspace returned to the Free tier.')
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : 'Failed to cancel subscription.',
      )
    } finally {
      setBillingAction('idle')
    }
  }

  async function handleLoadProviderCredentials() {
    setProviderCredentialStatus('loading')
    setProviderCredentialError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/provider-credentials`, {
        headers: workspaceAuthHeaders,
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      setProviderCredentials(
        (await response.json()) as ProviderCredentialListResponse,
      )
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to load provider credentials.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  async function handleSaveProviderCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProviderCredentialStatus('saving')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials${
          providerCredentialForm.credentialId
            ? `/${providerCredentialForm.credentialId}`
            : ''
        }`,
        {
          method: providerCredentialForm.credentialId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...workspaceAuthHeaders,
          },
          body: JSON.stringify({
            providerId: providerCredentialForm.providerId,
            label: providerCredentialForm.label,
            apiKey: providerCredentialForm.apiKey,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      setProviderCredentialForm(defaultProviderCredentialForm)
      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to save provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  function handleEditProviderCredential(credential: ProviderCredential) {
    setProviderCredentialForm({
      credentialId: credential.credentialId,
      providerId: credential.providerId,
      label: credential.label,
      apiKey: '',
    })
  }

  async function handleDeleteProviderCredential(credentialId: string) {
    setProviderCredentialStatus('saving')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials/${credentialId}`,
        {
          method: 'DELETE',
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to delete provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  async function handleTestProviderCredential(credentialId: string) {
    setProviderCredentialStatus('testing')
    setProviderCredentialError(null)

    try {
      const response = await fetch(
        `${apiBaseUrl}/provider-credentials/${credentialId}/test`,
        {
          method: 'POST',
          headers: workspaceAuthHeaders,
        },
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      await handleLoadProviderCredentials()
    } catch (error) {
      setProviderCredentialError(
        error instanceof Error
          ? error.message
          : 'Failed to test provider credential.',
      )
    } finally {
      setProviderCredentialStatus('idle')
    }
  }

  function handlePipelineStreamEvent(event: PipelineStreamEvent) {
    setStreamEvents((current) => [...current, event])
    lastStreamEventIdRef.current = event.eventId
    setLastStreamEventId(event.eventId)

    if (event.type === 'artifact') {
      setStreamedArtifacts((current) => {
        if (current.length === 0) {
          setActiveArtifactType(event.artifactType)
        }

        return [...current, event.artifact]
      })
    }

    if (event.type === 'completed') {
      setPipelineResult(event.result)
      setPipelineState('completed')
    }

    if (event.type === 'workflow_status') {
      setActiveTemporalWorkflow((current) =>
        current
          ? {
              ...current,
              temporalRunId: event.temporalRunId ?? current.temporalRunId,
              status: event.status,
            }
          : current,
      )

      if (event.status === 'completed') {
        setPipelineState('completed')
      }

      if (isTemporalTerminalStatus(event.status) && event.status !== 'completed') {
        setPipelineState('error')
        setPipelineError(formatTemporalFailureMessage(event.status))
      }
    }

    if (event.type === 'error') {
      setPipelineState('error')
      setPipelineError(event.message)
    }
  }

  const activeFinding =
    draftRun?.shieldScan.findings.find(
      (finding) => finding.findingId === activeFindingId,
    ) ?? draftRun?.shieldScan.findings[0]
  const selectedArtifact =
    (pipelineResult?.artifacts ?? streamedArtifacts).find(
      (artifact) => artifact.metadata.artifactType === activeArtifactType,
    ) ?? (pipelineResult?.artifacts ?? streamedArtifacts)[0]
  const visibleArtifacts = pipelineResult?.artifacts ?? streamedArtifacts
  const statusEvents = streamEvents.filter((event) => event.type === 'status')
  const workflowStatusEvents = streamEvents.filter(
    (event) => event.type === 'workflow_status',
  )
  const displayedSteps: PipelineStep[] =
    pipelineResult?.steps ??
    (workflowStatusEvents.length > 0
      ? workflowStatusEvents.map((event) => ({
          stepId: event.workflowId,
          label: `Temporal workflow (${event.taskQueue})`,
          status: mapTemporalStatusToStepStatus(event.status),
        }))
      : statusEvents)
  const selectedAgentCount = reviewDraft?.selectedAgents.length ?? 0
  const selectedSpecialistCount =
    reviewDraft?.selectedAgents.filter((agent) => agent !== 'moderator').length ?? 0
  const showResumeTemporalObservation =
    useTemporalWorkflowRuntime &&
    canResumeTemporalWorkflow({
      runId: draftRun?.runId,
      workflow: activeTemporalWorkflow,
    })

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI Council / AI War Room</p>
          <h1>Turn a raw idea into build-ready product artifacts.</h1>
          <p className="hero-text">
            A structured planning engine that runs isolated AI specialists,
            validates their output, and produces an executive summary, PRD, and
            development prompt without becoming another chat app.
          </p>
          <div className="hero-actions">
            <a href="#idea" className="primary-action">
              Draft first idea
            </a>
            <a href="#pipeline" className="secondary-action">
              View pipeline
            </a>
          </div>
        </div>

        <div className="war-room-card" aria-label="Run preview">
          <div className="card-header">
            <span>Standard run</span>
            <strong>Under 5 min</strong>
          </div>
          <form className="idea-form" id="idea" onSubmit={handleCreateDraftRun}>
            <label htmlFor="rawIdea">Raw idea</label>
            <textarea
              id="rawIdea"
              value={rawIdea}
              onChange={(event) => setRawIdea(event.target.value)}
              rows={7}
            />
            <label htmlFor="targetAudience">Target audience</label>
            <input
              id="targetAudience"
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
            <button type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Creating draft...' : 'Create draft run'}
            </button>
            {submitError ? <p className="form-error">{submitError}</p> : null}
          </form>
          <div className="shield-status">
            <span className="status-dot"></span>
            Shield:{' '}
            {draftRun
              ? `${draftRun.shieldScan.status} (${draftRun.shieldScan.findings.length} findings)`
              : 'clear by default, visible only when risk is meaningful.'}
          </div>
          <div className={`api-status api-status--${apiHealth}`}>
            API status: {apiHealth}
          </div>
        </div>
      </section>

      <section className="panel provider-panel">
        <div className="section-heading">
          <p className="eyebrow">Provider Keys</p>
          <h2>Connect workspace AI providers.</h2>
          <p>
            Add Anthropic or OpenAI keys from the client UI. Keys are sent
            directly to the backend, encrypted before PostgreSQL storage, and
            never returned to the browser.
          </p>
        </div>

        {providerCredentials?.needsProviderKey ? (
          <div className="provider-alert">
            <strong>No backend provider keys found.</strong>
            <p>
              Local mock mode still works, but real provider runs need a
              workspace key or a server-side environment key.
            </p>
          </div>
        ) : null}

        <div className="provider-grid">
          <form className="provider-form" onSubmit={handleSaveProviderCredential}>
            <span>
              {providerCredentialForm.credentialId ? 'Edit key' : 'Add key'}
            </span>
            <label>
              Provider
              <select
                value={providerCredentialForm.providerId}
                disabled={Boolean(providerCredentialForm.credentialId)}
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    providerId: event.target.value as ProviderCredentialForm['providerId'],
                    label:
                      event.target.value === 'anthropic'
                        ? 'Anthropic workspace key'
                        : 'OpenAI workspace key',
                  }))
                }
              >
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>
            <label>
              Label
              <input
                value={providerCredentialForm.label}
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              API key
              <input
                value={providerCredentialForm.apiKey}
                placeholder="sk-..."
                type="password"
                onChange={(event) =>
                  setProviderCredentialForm((current) => ({
                    ...current,
                    apiKey: event.target.value,
                  }))
                }
              />
            </label>
            <div className="provider-actions">
              <button
                type="submit"
                disabled={
                  providerCredentialStatus === 'saving' ||
                  providerCredentialForm.apiKey.length < 12
                }
              >
                {providerCredentialStatus === 'saving'
                  ? 'Saving...'
                  : providerCredentialForm.credentialId
                    ? 'Update encrypted key'
                    : 'Save encrypted key'}
              </button>
              {providerCredentialForm.credentialId ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setProviderCredentialForm(defaultProviderCredentialForm)
                  }
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
            {providerCredentialError ? (
              <p className="form-error">{providerCredentialError}</p>
            ) : null}
          </form>

          <div className="provider-list">
            <span>Saved keys</span>
            {providerCredentialStatus === 'loading' ? (
              <p className="clear-copy">Loading provider keys...</p>
            ) : null}
            {providerCredentials?.credentials.length ? (
              providerCredentials.credentials.map((credential) => (
                <article className="provider-key-card" key={credential.credentialId}>
                  <div>
                    <strong>{credential.label}</strong>
                    <p>
                      {credential.providerId} - {credential.maskedKey}
                    </p>
                    <small>
                      Test status: {credential.lastTestStatus}
                      {credential.lastTestError
                        ? ` (${credential.lastTestError})`
                        : ''}
                    </small>
                  </div>
                  <div className="provider-card-actions">
                    <button
                      type="button"
                      onClick={() => handleTestProviderCredential(credential.credentialId)}
                    >
                      Test connection
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEditProviderCredential(credential)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDeleteProviderCredential(credential.credentialId)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="clear-copy">No workspace provider keys saved yet.</p>
            )}
          </div>
        </div>

        {providerCredentials ? (
          <div className="provider-instructions">
            {Object.entries(providerCredentials.instructions).map(
              ([providerId, instruction]) => (
                <article key={providerId}>
                  <strong>Where to get {instruction.label} keys</strong>
                  <a href={instruction.url} target="_blank" rel="noreferrer">
                    Open provider console
                  </a>
                  <ol>
                    {instruction.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
              ),
            )}
          </div>
        ) : null}
      </section>

      <section className="panel billing-panel" id="billing">
        <div className="section-heading">
          <p className="eyebrow">Workspace Billing</p>
          <h2>Upgrade tiers and unlock paid features.</h2>
          <p>
            Market Research and higher daily usage limits require a paid
            workspace tier. Checkout uses mock billing locally or Stripe in
            production.
          </p>
        </div>

        {authCapabilities?.supportsAuthRollout && authRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Auth rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${authRollout.status}`}
              >
                {formatAuthRolloutStatus(authRollout.status)}
              </strong>
            </div>
            <p>{authRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {authRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatAuthRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {authRollout.checkedAt}</small>
          </div>
        ) : null}

        {llmRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>LLM rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${llmRollout.status}`}
              >
                {formatLlmRolloutStatus(llmRollout.status)}
              </strong>
            </div>
            <p>{llmRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {llmRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatLlmRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {llmRollout.checkedAt}</small>
          </div>
        ) : null}

        {researchRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Research rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${researchRollout.status}`}
              >
                {formatResearchRolloutStatus(researchRollout.status)}
              </strong>
            </div>
            <p>{researchRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {researchRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatResearchRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {researchRollout.checkedAt}</small>
          </div>
        ) : null}

        {temporalRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Temporal rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${temporalRollout.status}`}
              >
                {formatTemporalRolloutStatus(temporalRollout.status)}
              </strong>
            </div>
            <p>{temporalRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {temporalRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatTemporalRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {temporalRollout.checkedAt}</small>
          </div>
        ) : null}

        {modelRouterRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Model router rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${modelRouterRollout.status}`}
              >
                {formatModelRouterRolloutStatus(modelRouterRollout.status)}
              </strong>
            </div>
            <p>{modelRouterRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {modelRouterRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatModelRouterRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {modelRouterRollout.checkedAt}</small>
          </div>
        ) : null}

        {shieldRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Shield rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${shieldRollout.status}`}
              >
                {formatShieldRolloutStatus(shieldRollout.status)}
              </strong>
            </div>
            <p>{shieldRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {shieldRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatShieldRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {shieldRollout.checkedAt}</small>
          </div>
        ) : null}

        {providerCredentialsRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Provider credentials rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${providerCredentialsRollout.status}`}
              >
                {formatProviderCredentialsRolloutStatus(
                  providerCredentialsRollout.status,
                )}
              </strong>
            </div>
            <p>{providerCredentialsRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {providerCredentialsRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatProviderCredentialsRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {providerCredentialsRollout.checkedAt}</small>
          </div>
        ) : null}

        {observabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Observability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${observabilityRollout.status}`}
              >
                {formatObservabilityRolloutStatus(observabilityRollout.status)}
              </strong>
            </div>
            <p>{observabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {observabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatObservabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {observabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {promptEvaluationRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Prompt evaluation rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${promptEvaluationRollout.status}`}
              >
                {formatPromptEvaluationRolloutStatus(promptEvaluationRollout.status)}
              </strong>
            </div>
            <p>{promptEvaluationRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {promptEvaluationRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatPromptEvaluationRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {promptEvaluationRollout.checkedAt}</small>
          </div>
        ) : null}

        {runHistoryRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Run history rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${runHistoryRollout.status}`}
              >
                {formatRunHistoryRolloutStatus(runHistoryRollout.status)}
              </strong>
            </div>
            <p>{runHistoryRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {runHistoryRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatRunHistoryRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {runHistoryRollout.checkedAt}</small>
          </div>
        ) : null}

        {streamReplayRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Stream replay rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${streamReplayRollout.status}`}
              >
                {formatStreamReplayRolloutStatus(streamReplayRollout.status)}
              </strong>
            </div>
            <p>{streamReplayRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {streamReplayRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatStreamReplayRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {streamReplayRollout.checkedAt}</small>
          </div>
        ) : null}

        {idempotencyRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Idempotency rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${idempotencyRollout.status}`}
              >
                {formatIdempotencyRolloutStatus(idempotencyRollout.status)}
              </strong>
            </div>
            <p>{idempotencyRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {idempotencyRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatIdempotencyRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {idempotencyRollout.checkedAt}</small>
          </div>
        ) : null}

        {usageLimitsRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Usage limits rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${usageLimitsRollout.status}`}
              >
                {formatUsageLimitsRolloutStatus(usageLimitsRollout.status)}
              </strong>
            </div>
            <p>{usageLimitsRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {usageLimitsRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatUsageLimitsRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {usageLimitsRollout.checkedAt}</small>
          </div>
        ) : null}

        {deploymentRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Deployment health rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${deploymentRollout.status}`}
              >
                {formatDeploymentRolloutStatus(deploymentRollout.status)}
              </strong>
            </div>
            <p>{deploymentRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {deploymentRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatDeploymentRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {deploymentRollout.checkedAt}</small>
          </div>
        ) : null}

        {migrationRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Database migration rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${migrationRollout.status}`}
              >
                {formatMigrationRolloutStatus(migrationRollout.status)}
              </strong>
            </div>
            <p>{migrationRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {migrationRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatMigrationRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {migrationRollout.checkedAt}</small>
          </div>
        ) : null}

        {backupRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production backup rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${backupRollout.status}`}
              >
                {formatBackupRolloutStatus(backupRollout.status)}
              </strong>
            </div>
            <p>{backupRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {backupRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatBackupRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {backupRollout.checkedAt}</small>
          </div>
        ) : null}

        {auditTrailRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production audit trail rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${auditTrailRollout.status}`}
              >
                {formatAuditTrailRolloutStatus(auditTrailRollout.status)}
              </strong>
            </div>
            <p>{auditTrailRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {auditTrailRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatAuditTrailRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {auditTrailRollout.checkedAt}</small>
          </div>
        ) : null}

        {complianceRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production compliance rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${complianceRollout.status}`}
              >
                {formatComplianceRolloutStatus(complianceRollout.status)}
              </strong>
            </div>
            <p>{complianceRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {complianceRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatComplianceRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {complianceRollout.checkedAt}</small>
          </div>
        ) : null}

        {incidentResponseRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production incident response rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${incidentResponseRollout.status}`}
              >
                {formatIncidentResponseRolloutStatus(
                  incidentResponseRollout.status,
                )}
              </strong>
            </div>
            <p>{incidentResponseRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {incidentResponseRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatIncidentResponseRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {incidentResponseRollout.checkedAt}</small>
          </div>
        ) : null}

        {releaseRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production release rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${releaseRollout.status}`}
              >
                {formatReleaseRolloutStatus(releaseRollout.status)}
              </strong>
            </div>
            <p>{releaseRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {releaseRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatReleaseRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {releaseRollout.checkedAt}</small>
          </div>
        ) : null}

        {sloRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production SLO rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${sloRollout.status}`}
              >
                {formatSloRolloutStatus(sloRollout.status)}
              </strong>
            </div>
            <p>{sloRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {sloRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatSloRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {sloRollout.checkedAt}</small>
          </div>
        ) : null}

        {capacityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production capacity rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${capacityRollout.status}`}
              >
                {formatCapacityRolloutStatus(capacityRollout.status)}
              </strong>
            </div>
            <p>{capacityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {capacityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>{formatCapacityRolloutCheckStatus(check.status)}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {capacityRollout.checkedAt}</small>
          </div>
        ) : null}

        {performanceRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production performance rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${performanceRollout.status}`}
              >
                {formatPerformanceRolloutStatus(performanceRollout.status)}
              </strong>
            </div>
            <p>{performanceRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {performanceRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatPerformanceRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {performanceRollout.checkedAt}</small>
          </div>
        ) : null}

        {resilienceRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production resilience rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${resilienceRollout.status}`}
              >
                {formatResilienceRolloutStatus(resilienceRollout.status)}
              </strong>
            </div>
            <p>{resilienceRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {resilienceRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatResilienceRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {resilienceRollout.checkedAt}</small>
          </div>
        ) : null}

        {availabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production availability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${availabilityRollout.status}`}
              >
                {formatAvailabilityRolloutStatus(availabilityRollout.status)}
              </strong>
            </div>
            <p>{availabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {availabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatAvailabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {availabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {reliabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production reliability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${reliabilityRollout.status}`}
              >
                {formatReliabilityRolloutStatus(reliabilityRollout.status)}
              </strong>
            </div>
            <p>{reliabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {reliabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatReliabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {reliabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {stabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production stability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${stabilityRollout.status}`}
              >
                {formatStabilityRolloutStatus(stabilityRollout.status)}
              </strong>
            </div>
            <p>{stabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {stabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatStabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {stabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {consistencyRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production consistency rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${consistencyRollout.status}`}
              >
                {formatConsistencyRolloutStatus(consistencyRollout.status)}
              </strong>
            </div>
            <p>{consistencyRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {consistencyRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatConsistencyRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {consistencyRollout.checkedAt}</small>
          </div>
        ) : null}

        {integrityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production integrity rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${integrityRollout.status}`}
              >
                {formatIntegrityRolloutStatus(integrityRollout.status)}
              </strong>
            </div>
            <p>{integrityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {integrityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatIntegrityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {integrityRollout.checkedAt}</small>
          </div>
        ) : null}

        {durabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production durability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${durabilityRollout.status}`}
              >
                {formatDurabilityRolloutStatus(durabilityRollout.status)}
              </strong>
            </div>
            <p>{durabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {durabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatDurabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {durabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {recoverabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production recoverability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${recoverabilityRollout.status}`}
              >
                {formatRecoverabilityRolloutStatus(recoverabilityRollout.status)}
              </strong>
            </div>
            <p>{recoverabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {recoverabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatRecoverabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {recoverabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {maintainabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production maintainability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${maintainabilityRollout.status}`}
              >
                {formatMaintainabilityRolloutStatus(maintainabilityRollout.status)}
              </strong>
            </div>
            <p>{maintainabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {maintainabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatMaintainabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {maintainabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {scalabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production scalability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${scalabilityRollout.status}`}
              >
                {formatScalabilityRolloutStatus(scalabilityRollout.status)}
              </strong>
            </div>
            <p>{scalabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {scalabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatScalabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {scalabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {traceabilityRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Production traceability rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${traceabilityRollout.status}`}
              >
                {formatTraceabilityRolloutStatus(traceabilityRollout.status)}
              </strong>
            </div>
            <p>{traceabilityRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {traceabilityRollout.checks.map((check) => (
                <article
                  className={`billing-rollout-check billing-rollout-check--${check.status}`}
                  key={check.name}
                >
                  <strong>{check.label}</strong>
                  <span>
                    {formatTraceabilityRolloutCheckStatus(check.status)}
                  </span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
            <small>Checked at {traceabilityRollout.checkedAt}</small>
          </div>
        ) : null}

        {billingCapabilities?.supportsBillingRollout && billingRollout ? (
          <div className="billing-rollout">
            <div className="billing-rollout__header">
              <span>Billing rollout readiness</span>
              <strong
                className={`billing-rollout__status billing-rollout__status--${billingRollout.status}`}
              >
                {formatBillingRolloutStatus(billingRollout.status)}
              </strong>
            </div>
            <p>{billingRollout.guidance}</p>
            <div className="billing-rollout__checks">
              {billingRollout.checks.map((check) => (
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
            <small>Checked at {billingRollout.checkedAt}</small>
          </div>
        ) : null}

        {billingCapabilities?.supportsBillingAlerts && billingAlerts.length ? (
          <div className="billing-alerts">
            <span>Billing alerts</span>
            {billingAlerts.map((alert) => (
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
            <strong>{defaultWorkspaceId}</strong>
            <p>
              Tier:{' '}
              {billingStatus?.billingRecord
                ? formatPaidTier(billingStatus.billingRecord.paidTier)
                : 'Unknown'}
            </p>
            <p>
              Status:{' '}
              {billingStatus?.billingRecord
                ? formatBillingStatus(billingStatus.billingRecord.status)
                : billingAction === 'loading'
                  ? 'Loading...'
                  : 'Unavailable'}
            </p>
            {billingStatus?.billingRecord?.externalCustomerId ? (
              <small>
                Customer: {billingStatus.billingRecord.externalCustomerId}
              </small>
            ) : null}
          </article>

          <article className="billing-guidance-card">
            <span>Billing mode</span>
            <strong>
              {billingCapabilities?.enabled
                ? billingCapabilities.adapter === 'mock'
                  ? 'Mock checkout'
                  : 'Stripe checkout'
                : 'Disabled'}
            </strong>
            <p>{describeBillingCapabilities(billingCapabilities)}</p>
            <div className="billing-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={billingAction !== 'idle'}
                onClick={() => void handleLoadBillingStatus()}
              >
                Refresh billing status
              </button>
              {canOpenCustomerPortal(
                billingCapabilities,
                billingStatus?.billingRecord?.externalCustomerId,
              ) ? (
                <button
                  type="button"
                  disabled={billingAction !== 'idle'}
                  onClick={() => void handleOpenCustomerPortal()}
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
                    onClick={() => void handleCancelMockSubscription()}
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
              onClick={() => setMockCustomerPortal(null)}
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

        {billingError ? (
          <p className="form-error">{billingError}</p>
        ) : null}

        <div className="billing-grid">
          {(['free', 'pro', 'business'] as const).map((tier) => {
            const currentTier = billingStatus?.billingRecord?.paidTier ?? 'free'
            const isCurrent = currentTier === tier
            const isUpgradeTarget =
              billingCapabilities?.checkoutTiers.includes(
                tier as CheckoutPaidTier,
              ) ?? false

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
                  billingCapabilities?.supportsCheckout ? (
                  <button
                    type="button"
                    disabled={billingAction === 'upgrading'}
                    onClick={() => void handleUpgradeBillingTier(tier)}
                  >
                    {billingAction === 'upgrading'
                      ? 'Starting checkout...'
                      : `Upgrade to ${formatPaidTier(tier)}`}
                  </button>
                ) : (
                  <p className="clear-copy">
                    {billingCapabilities?.enabled
                      ? 'Checkout unavailable for this tier.'
                      : 'Enable STRIPE_ENABLED=true on the API to start checkout.'}
                  </p>
                )}
              </article>
            )
          })}
        </div>

        {billingCapabilities?.supportsUsageSummary && billingUsageSummary ? (
          <div className="billing-usage-summary">
            <span>Daily usage</span>
            <p className="clear-copy">
              UTC period ending{' '}
              {new Date(billingUsageSummary.usagePeriodEnd).toLocaleString()}
            </p>
            <div className="billing-usage-meters">
              <article className="billing-usage-meter">
                <div className="billing-usage-meter__header">
                  <strong>Tokens</strong>
                  <small>
                    {formatUsageMeterLabel(
                      billingUsageSummary.dailyUsage.totalTokens,
                      billingUsageSummary.dailyTokenLimit,
                      'tokens',
                    )}
                  </small>
                </div>
                <div
                  className="billing-usage-meter__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={billingUsageSummary.dailyTokenLimit}
                  aria-valuenow={billingUsageSummary.dailyUsage.totalTokens}
                  aria-label="Daily token usage"
                >
                  <div
                    className="billing-usage-meter__fill"
                    style={{
                      width: `${formatUsagePercent(
                        billingUsageSummary.dailyUsage.totalTokens,
                        billingUsageSummary.dailyTokenLimit,
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
                      billingUsageSummary.dailyUsage.estimatedCostUsd,
                      billingUsageSummary.dailyCostLimitUsd,
                    )}
                  </small>
                </div>
                <div
                  className="billing-usage-meter__track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={billingUsageSummary.dailyCostLimitUsd}
                  aria-valuenow={billingUsageSummary.dailyUsage.estimatedCostUsd}
                  aria-label="Daily estimated cost usage"
                >
                  <div
                    className="billing-usage-meter__fill billing-usage-meter__fill--cost"
                    style={{
                      width: `${formatUsagePercent(
                        billingUsageSummary.dailyUsage.estimatedCostUsd,
                        billingUsageSummary.dailyCostLimitUsd,
                      )}%`,
                    }}
                  />
                </div>
              </article>
            </div>
          </div>
        ) : null}

        {usageCapabilities?.supportsUsageAdminTools && usageAdminSummary ? (
          <div className="billing-admin">
            <div className="billing-admin__header">
              <span>Usage admin tools</span>
              <strong>{usageAdminSummary.role}</strong>
            </div>
            <p>{usageAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Daily events</span>
                <strong>{usageAdminSummary.stats.dailyEventCount}</strong>
                <small>{usageAdminSummary.stats.distinctRunCount} runs</small>
              </article>
              <article className="billing-admin-stat">
                <span>Token utilization</span>
                <strong>{usageAdminSummary.stats.tokenUtilizationPercent}%</strong>
                <small>
                  {usageAdminSummary.usage.dailyUsage.totalTokens.toLocaleString()}{' '}
                  tokens
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Cost utilization</span>
                <strong>{usageAdminSummary.stats.costUtilizationPercent}%</strong>
                <small>
                  ${usageAdminSummary.usage.dailyUsage.estimatedCostUsd.toFixed(2)}{' '}
                  used
                </small>
              </article>
            </div>
            {usageAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {usageAdminSummary.availableActions.map((action) => (
                  <button
                    key={action}
                    className="danger-button"
                    type="button"
                    disabled={
                      billingAction !== 'idle' ||
                      usageAdminAction !== 'idle' ||
                      billingAdminAction !== 'idle'
                    }
                    onClick={() => void handleUsageAdminAction(action)}
                  >
                    {formatUsageAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {settingsAdminSummary ? (
          <div className="billing-admin workspace-settings-admin">
            <div className="billing-admin__header">
              <span>Workspace settings admin</span>
              <strong>{settingsAdminSummary.role}</strong>
            </div>
            <p>{settingsAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Workspace name</span>
                <strong>{settingsAdminSummary.settings.name}</strong>
                <small>{settingsAdminSummary.settings.workspaceId}</small>
              </article>
              <article className="billing-admin-stat">
                <span>Created</span>
                <strong>{settingsAdminSummary.settings.createdAt.slice(0, 10)}</strong>
                <small>UTC timestamp</small>
              </article>
            </div>
            {settingsAdminSummary.availableActions.includes(
              'update_workspace_name',
            ) ? (
              <form
                className="workspace-settings-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!workspaceNameDraft.trim()) {
                    return
                  }
                  void handleSettingsAdminAction({
                    action: 'update_workspace_name',
                    name: workspaceNameDraft.trim(),
                  })
                }}
              >
                <label>
                  Workspace name
                  <input
                    value={workspaceNameDraft}
                    onChange={(event) => setWorkspaceNameDraft(event.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={
                    settingsAdminAction !== 'idle' ||
                    !workspaceNameDraft.trim() ||
                    workspaceNameDraft.trim() ===
                      settingsAdminSummary.settings.name
                  }
                >
                  Save workspace name
                </button>
              </form>
            ) : null}
            {settingsAdminSummary.availableActions.includes(
              'reset_workspace_name',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={settingsAdminAction !== 'idle'}
                onClick={() =>
                  void handleSettingsAdminAction({
                    action: 'reset_workspace_name',
                  })
                }
              >
                Reset workspace name
              </button>
            ) : null}
          </div>
        ) : null}

        {modelHealthAdminSummary ? (
          <div className="billing-admin workspace-model-health-admin">
            <div className="billing-admin__header">
              <span>Model health admin</span>
              <strong>{modelHealthAdminSummary.role}</strong>
            </div>
            <p>{modelHealthAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Active models</span>
                <strong>{modelHealthAdminSummary.stats.activeModels}</strong>
                <small>
                  {modelHealthAdminSummary.stats.totalModels} total in registry
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Degraded models</span>
                <strong>{modelHealthAdminSummary.stats.degradedModels}</strong>
                <small>
                  {modelHealthAdminSummary.stats.candidateModels} candidates
                </small>
              </article>
            </div>
            <div className="workspace-model-health-list">
              {modelHealthAdminSummary.models.map((model) => (
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
                  {modelHealthAdminSummary.availableActions.includes(
                    'recover_model',
                  ) && model.healthStatus === 'degraded' ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={modelHealthAdminAction !== 'idle'}
                      onClick={() =>
                        void handleModelHealthAdminAction(model.modelId)
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

        {shieldReviewAdminSummary ? (
          <div className="billing-admin workspace-shield-review-admin">
            <div className="billing-admin__header">
              <span>Shield review admin</span>
              <strong>{shieldReviewAdminSummary.role}</strong>
            </div>
            <p>{shieldReviewAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Review cases</span>
                <strong>{shieldReviewAdminSummary.stats.totalCases}</strong>
                <small>{shieldReviewAdminSummary.stats.passedCases} passed</small>
              </article>
              <article className="billing-admin-stat">
                <span>False positives</span>
                <strong>{shieldReviewAdminSummary.stats.falsePositiveCount}</strong>
                <small>
                  {formatFalsePositiveRate(
                    shieldReviewAdminSummary.stats.falsePositiveRate,
                  )}{' '}
                  rate
                </small>
              </article>
            </div>
            <p className="clear-copy">
              Classifier: {shieldReviewAdminSummary.classifierId}
            </p>
            <div className="workspace-shield-review-list">
              {shieldReviewAdminSummary.cases.map((reviewCase) => (
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
            {shieldReviewAdminSummary.availableActions.includes(
              'rerun_review_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={shieldReviewAdminAction !== 'idle'}
                onClick={() =>
                  void handleShieldReviewAdminAction('rerun_review_summary')
                }
              >
                {formatShieldReviewAdminAction('rerun_review_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {providerKeyAdminSummary ? (
          <div className="billing-admin workspace-provider-key-admin">
            <div className="billing-admin__header">
              <span>Provider key admin</span>
              <strong>{providerKeyAdminSummary.role}</strong>
            </div>
            <p>{providerKeyAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Workspace keys</span>
                <strong>{providerKeyAdminSummary.stats.totalCredentials}</strong>
                <small>
                  {providerKeyAdminSummary.stats.passedCredentials} passed
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Failed / untested</span>
                <strong>{providerKeyAdminSummary.stats.failedCredentials}</strong>
                <small>
                  {providerKeyAdminSummary.stats.untestedCredentials} untested
                </small>
              </article>
            </div>
            <div className="workspace-provider-key-list">
              {providerKeyAdminSummary.credentials.length ? (
                providerKeyAdminSummary.credentials.map((credential) => (
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
            {providerKeyAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {providerKeyAdminSummary.availableActions.map((action) => (
                  <button
                    key={action}
                    className="secondary-button"
                    type="button"
                    disabled={providerKeyAdminAction !== 'idle'}
                    onClick={() => void handleProviderKeyAdminAction(action)}
                  >
                    {formatProviderKeyAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {observabilityAdminSummary ? (
          <div className="billing-admin workspace-observability-admin">
            <div className="billing-admin__header">
              <span>Observability admin</span>
              <strong>{observabilityAdminSummary.role}</strong>
            </div>
            <p>{observabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Recent events</span>
                <strong>{observabilityAdminSummary.stats.totalEvents}</strong>
                <small>
                  {observabilityAdminSummary.stats.pipelinePhaseEvents} pipeline
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Errors / warnings</span>
                <strong>{observabilityAdminSummary.stats.errorEvents}</strong>
                <small>{observabilityAdminSummary.stats.warnEvents} warnings</small>
              </article>
            </div>
            <div className="workspace-observability-event-list">
              {observabilityAdminSummary.events.length ? (
                observabilityAdminSummary.events.map((event) => (
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
            {observabilityAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {observabilityAdminSummary.availableActions.map((action) => (
                  <button
                    key={action}
                    className={
                      action === 'clear_observability_buffer'
                        ? 'danger-button'
                        : 'secondary-button'
                    }
                    type="button"
                    disabled={observabilityAdminAction !== 'idle'}
                    onClick={() => void handleObservabilityAdminAction(action)}
                  >
                    {formatObservabilityAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {promptRegressionAdminSummary ? (
          <div className="billing-admin workspace-prompt-regression-admin">
            <div className="billing-admin__header">
              <span>Prompt regression admin</span>
              <strong>{promptRegressionAdminSummary.role}</strong>
            </div>
            <p>{promptRegressionAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Regression cases</span>
                <strong>{promptRegressionAdminSummary.stats.totalCases}</strong>
                <small>{promptRegressionAdminSummary.stats.passedCases} passed</small>
              </article>
              <article className="billing-admin-stat">
                <span>Failures / drift</span>
                <strong>{promptRegressionAdminSummary.stats.failedCases}</strong>
                <small>
                  {promptRegressionAdminSummary.stats.promptVersionDriftCount} drift
                </small>
              </article>
            </div>
            <p className="clear-copy">
              Generated at {promptRegressionAdminSummary.generatedAt.slice(0, 19).replace('T', ' ')}
            </p>
            <div className="workspace-prompt-regression-list">
              {promptRegressionAdminSummary.cases.map((regressionCase) => (
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
            {promptRegressionAdminSummary.availableActions.includes(
              'rerun_prompt_regression',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={promptRegressionAdminAction !== 'idle'}
                onClick={() =>
                  void handlePromptRegressionAdminAction('rerun_prompt_regression')
                }
              >
                {formatPromptRegressionAdminAction('rerun_prompt_regression')}
              </button>
            ) : null}
          </div>
        ) : null}

        {runHistoryAdminSummary ? (
          <div className="billing-admin workspace-run-history-admin">
            <div className="billing-admin__header">
              <span>Run history admin</span>
              <strong>{runHistoryAdminSummary.role}</strong>
            </div>
            <p>{runHistoryAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Artifacts</span>
                <strong>{runHistoryAdminSummary.stats.totalArtifacts}</strong>
                <small>{runHistoryAdminSummary.stats.uniqueRunCount} runs</small>
              </article>
              <article className="billing-admin-stat">
                <span>Artifact mix</span>
                <strong>{runHistoryAdminSummary.stats.executiveSummaryCount}</strong>
                <small>
                  {runHistoryAdminSummary.stats.prdCount} PRD ·{' '}
                  {runHistoryAdminSummary.stats.developmentPromptCount} dev prompt
                </small>
              </article>
            </div>
            <div className="workspace-run-history-list">
              {runHistoryAdminSummary.artifacts.length ? (
                runHistoryAdminSummary.artifacts.map((artifact) => (
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
                disabled={runHistoryAdminAction !== 'idle'}
                onClick={() => void handleExportRunHistory('csv')}
              >
                Export run history CSV
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={runHistoryAdminAction !== 'idle'}
                onClick={() => void handleExportRunHistory('json')}
              >
                Export run history JSON
              </button>
            </div>
            {runHistoryAdminSummary.availableActions.includes(
              'refresh_run_history_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={runHistoryAdminAction !== 'idle'}
                onClick={() =>
                  void handleRunHistoryAdminAction('refresh_run_history_summary')
                }
              >
                {formatRunHistoryAdminAction('refresh_run_history_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {streamRecoveryAdminSummary ? (
          <div className="billing-admin workspace-stream-recovery-admin">
            <div className="billing-admin__header">
              <span>Stream recovery admin</span>
              <strong>{streamRecoveryAdminSummary.role}</strong>
            </div>
            <p>{streamRecoveryAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Buffered runs</span>
                <strong>{streamRecoveryAdminSummary.stats.bufferedRunCount}</strong>
                <small>
                  {streamRecoveryAdminSummary.stats.totalBufferedEvents} events
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Active / terminal</span>
                <strong>{streamRecoveryAdminSummary.stats.activeRunCount}</strong>
                <small>
                  {streamRecoveryAdminSummary.stats.terminalRunCount} terminal
                </small>
              </article>
            </div>
            <div className="workspace-stream-recovery-list">
              {streamRecoveryAdminSummary.bufferedRuns.length ? (
                streamRecoveryAdminSummary.bufferedRuns.map((bufferedRun) => (
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
            {streamRecoveryAdminSummary.availableActions.includes(
              'refresh_stream_recovery_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={streamRecoveryAdminAction !== 'idle'}
                onClick={() =>
                  void handleStreamRecoveryAdminAction(
                    'refresh_stream_recovery_summary',
                  )
                }
              >
                {formatStreamRecoveryAdminAction('refresh_stream_recovery_summary')}
              </button>
            ) : null}
            {streamRecoveryAdminSummary.availableActions.includes(
              'clear_workspace_stream_buffers',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={streamRecoveryAdminAction !== 'idle'}
                onClick={() =>
                  void handleStreamRecoveryAdminAction(
                    'clear_workspace_stream_buffers',
                  )
                }
              >
                {formatStreamRecoveryAdminAction('clear_workspace_stream_buffers')}
              </button>
            ) : null}
          </div>
        ) : null}

        {idempotencyAdminSummary ? (
          <div className="billing-admin workspace-idempotency-admin">
            <div className="billing-admin__header">
              <span>Idempotency admin</span>
              <strong>{idempotencyAdminSummary.role}</strong>
            </div>
            <p>{idempotencyAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Idempotency keys</span>
                <strong>{idempotencyAdminSummary.stats.totalKeys}</strong>
                <small>
                  {idempotencyAdminSummary.stats.activeReservations} active
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Runs / expired</span>
                <strong>{idempotencyAdminSummary.stats.linkedRunCount}</strong>
                <small>{idempotencyAdminSummary.stats.expiredKeys} expired</small>
              </article>
            </div>
            <div className="workspace-idempotency-list">
              {idempotencyAdminSummary.records.length ? (
                idempotencyAdminSummary.records.map((record) => (
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
            {idempotencyAdminSummary.availableActions.includes(
              'refresh_idempotency_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={idempotencyAdminAction !== 'idle'}
                onClick={() =>
                  void handleIdempotencyAdminAction('refresh_idempotency_summary')
                }
              >
                {formatIdempotencyAdminAction('refresh_idempotency_summary')}
              </button>
            ) : null}
            {idempotencyAdminSummary.availableActions.includes(
              'clear_workspace_idempotency_reservations',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={idempotencyAdminAction !== 'idle'}
                onClick={() =>
                  void handleIdempotencyAdminAction(
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

        {quotaAdminSummary ? (
          <div className="billing-admin workspace-quota-admin">
            <div className="billing-admin__header">
              <span>Quota admin</span>
              <strong>{quotaAdminSummary.role}</strong>
            </div>
            <p>{quotaAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Token quota</span>
                <strong>{quotaAdminSummary.stats.tokenUtilizationPercent}%</strong>
                <small>
                  {quotaAdminSummary.usage.dailyUsage.totalTokens.toLocaleString()} /{' '}
                  {quotaAdminSummary.usage.dailyTokenLimit.toLocaleString()}
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Cost quota</span>
                <strong>{quotaAdminSummary.stats.costUtilizationPercent}%</strong>
                <small>
                  ${quotaAdminSummary.usage.dailyUsage.estimatedCostUsd.toFixed(2)} / $
                  {quotaAdminSummary.usage.dailyCostLimitUsd.toFixed(2)}
                  {quotaAdminSummary.stats.quotaExceeded ? ' · Exceeded' : ''}
                </small>
              </article>
            </div>
            <div className="workspace-quota-list">
              {quotaAdminSummary.records.length ? (
                quotaAdminSummary.records.map((record) => (
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
            {quotaAdminSummary.availableActions.includes('refresh_quota_summary') ? (
              <button
                className="secondary-button"
                type="button"
                disabled={quotaAdminAction !== 'idle'}
                onClick={() => void handleQuotaAdminAction('refresh_quota_summary')}
              >
                {formatQuotaAdminAction('refresh_quota_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {deploymentAdminSummary ? (
          <div className="billing-admin workspace-deployment-admin">
            <div className="billing-admin__header">
              <span>Deployment admin</span>
              <strong>{deploymentAdminSummary.role}</strong>
            </div>
            <p>{deploymentAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Readiness</span>
                <strong>{deploymentAdminSummary.readinessStatus}</strong>
                <small>
                  {deploymentAdminSummary.stats.healthyDependencyCount}/
                  {deploymentAdminSummary.stats.totalDependencies} dependencies
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>API version</span>
                <strong>{deploymentAdminSummary.stats.apiVersion}</strong>
                <small>{deploymentAdminSummary.nodeEnv} · {deploymentAdminSummary.webOrigin}</small>
              </article>
            </div>
            <div className="workspace-deployment-list">
              {deploymentAdminSummary.dependencies.map((dependency) => (
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
              Checked at {deploymentAdminSummary.checkedAt.slice(0, 19).replace('T', ' ')}
            </p>
            {deploymentAdminSummary.availableActions.includes(
              'refresh_deployment_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={deploymentAdminAction !== 'idle'}
                onClick={() =>
                  void handleDeploymentAdminAction('refresh_deployment_summary')
                }
              >
                {formatDeploymentAdminAction('refresh_deployment_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {migrationAdminSummary ? (
          <div className="billing-admin workspace-migration-admin">
            <div className="billing-admin__header">
              <span>Migration admin</span>
              <strong>{migrationAdminSummary.role}</strong>
            </div>
            <p>{migrationAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Applied</span>
                <strong>{migrationAdminSummary.stats.appliedCount}</strong>
                <small>
                  {migrationAdminSummary.stats.pendingCount} pending of{' '}
                  {migrationAdminSummary.stats.totalMigrations}
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Schema table</span>
                <strong>
                  {migrationAdminSummary.stats.schemaMigrationsTableExists
                    ? 'Ready'
                    : 'Missing'}
                </strong>
                <small>schema_migrations tracking</small>
              </article>
            </div>
            <div className="workspace-migration-list">
              {migrationAdminSummary.records.length ? (
                migrationAdminSummary.records.map((record) => (
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
            {migrationAdminSummary.availableActions.includes(
              'refresh_migration_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={migrationAdminAction !== 'idle'}
                onClick={() =>
                  void handleMigrationAdminAction('refresh_migration_summary')
                }
              >
                {formatMigrationAdminAction('refresh_migration_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {backupAdminSummary ? (
          <div className="billing-admin workspace-backup-admin">
            <div className="billing-admin__header">
              <span>Backup admin</span>
              <strong>{backupAdminSummary.role}</strong>
            </div>
            <p>{backupAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Recoverable records</span>
                <strong>{backupAdminSummary.stats.totalRecords}</strong>
                <small>
                  {backupAdminSummary.stats.recoverableDomains}/
                  {backupAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Persistence</span>
                <strong>
                  {backupAdminSummary.stats.postgresConnectivity
                    ? 'PostgreSQL'
                    : 'Unavailable'}
                </strong>
                <small>
                  {backupAdminSummary.stats.redisBackedPersistence
                    ? 'Redis AOF enabled'
                    : 'Redis optional'}
                </small>
              </article>
            </div>
            <div className="workspace-backup-list">
              {backupAdminSummary.records.map((record) => (
                <article
                  className={`workspace-backup-card workspace-backup-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatBackupDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {backupAdminSummary.availableActions.includes(
              'refresh_backup_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={backupAdminAction !== 'idle'}
                onClick={() =>
                  void handleBackupAdminAction('refresh_backup_summary')
                }
              >
                {formatBackupAdminAction('refresh_backup_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {auditAdminSummary ? (
          <div className="billing-admin workspace-audit-trail-admin">
            <div className="billing-admin__header">
              <span>Audit trail admin</span>
              <strong>{auditAdminSummary.role}</strong>
            </div>
            <p>{auditAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Audit records</span>
                <strong>{auditAdminSummary.stats.totalRecords}</strong>
                <small>
                  {auditAdminSummary.stats.coveredDomains}/
                  {auditAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Export</span>
                <strong>Enabled</strong>
                <small>
                  {auditAdminSummary.stats.postgresConnectivity
                    ? 'PostgreSQL audit tables'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-audit-trail-list">
              {auditAdminSummary.records.map((record) => (
                <article
                  className={`workspace-audit-trail-card workspace-audit-trail-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatAuditDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {auditAdminSummary.availableActions.includes(
              'refresh_audit_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={auditAdminAction !== 'idle'}
                onClick={() =>
                  void handleAuditAdminAction('refresh_audit_summary')
                }
              >
                {formatAuditAdminAction('refresh_audit_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {complianceAdminSummary ? (
          <div className="billing-admin workspace-compliance-admin">
            <div className="billing-admin__header">
              <span>Compliance admin</span>
              <strong>{complianceAdminSummary.role}</strong>
            </div>
            <p>{complianceAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Attestation records</span>
                <strong>{complianceAdminSummary.stats.totalRecords}</strong>
                <small>
                  {complianceAdminSummary.stats.coveredDomains}/
                  {complianceAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Encryption</span>
                <strong>
                  {complianceAdminSummary.stats.encryptionKeyConfigured
                    ? 'Configured'
                    : 'Default key'}
                </strong>
                <small>
                  {complianceAdminSummary.stats.postgresConnectivity
                    ? 'PostgreSQL policy tables'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-compliance-list">
              {complianceAdminSummary.records.map((record) => (
                <article
                  className={`workspace-compliance-card workspace-compliance-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatComplianceDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {complianceAdminSummary.availableActions.includes(
              'refresh_compliance_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={complianceAdminAction !== 'idle'}
                onClick={() =>
                  void handleComplianceAdminAction('refresh_compliance_summary')
                }
              >
                {formatComplianceAdminAction('refresh_compliance_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {incidentAdminSummary ? (
          <div className="billing-admin workspace-incident-admin">
            <div className="billing-admin__header">
              <span>Incident admin</span>
              <strong>{incidentAdminSummary.role}</strong>
            </div>
            <p>{incidentAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Incident records</span>
                <strong>{incidentAdminSummary.stats.totalRecords}</strong>
                <small>
                  {incidentAdminSummary.stats.coveredDomains}/
                  {incidentAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Observability errors</span>
                <strong>
                  {incidentAdminSummary.stats.observabilityErrorEvents}
                </strong>
                <small>
                  {incidentAdminSummary.stats.postgresConnectivity
                    ? 'Recent workspace error events'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-incident-list">
              {incidentAdminSummary.records.map((record) => (
                <article
                  className={`workspace-incident-card workspace-incident-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatIncidentDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {incidentAdminSummary.availableActions.includes(
              'refresh_incident_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={incidentAdminAction !== 'idle'}
                onClick={() =>
                  void handleIncidentAdminAction('refresh_incident_summary')
                }
              >
                {formatIncidentAdminAction('refresh_incident_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {releaseAdminSummary ? (
          <div className="billing-admin workspace-release-admin">
            <div className="billing-admin__header">
              <span>Release admin</span>
              <strong>{releaseAdminSummary.role}</strong>
            </div>
            <p>{releaseAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Release records</span>
                <strong>{releaseAdminSummary.stats.totalRecords}</strong>
                <small>
                  {releaseAdminSummary.stats.coveredDomains}/
                  {releaseAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>API version</span>
                <strong>{releaseAdminSummary.stats.apiVersion}</strong>
                <small>
                  {releaseAdminSummary.stats.postgresConnectivity
                    ? 'Release artifact tables'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-release-list">
              {releaseAdminSummary.records.map((record) => (
                <article
                  className={`workspace-release-card workspace-release-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatReleaseDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {releaseAdminSummary.availableActions.includes(
              'refresh_release_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={releaseAdminAction !== 'idle'}
                onClick={() =>
                  void handleReleaseAdminAction('refresh_release_summary')
                }
              >
                {formatReleaseAdminAction('refresh_release_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {sloAdminSummary ? (
          <div className="billing-admin workspace-slo-admin">
            <div className="billing-admin__header">
              <span>SLO admin</span>
              <strong>{sloAdminSummary.role}</strong>
            </div>
            <p>{sloAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run success rate</span>
                <strong>{sloAdminSummary.stats.successRatePercent}%</strong>
                <small>
                  {sloAdminSummary.stats.coveredDomains}/
                  {sloAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>SLO signals</span>
                <strong>{sloAdminSummary.stats.totalRecords}</strong>
                <small>
                  {sloAdminSummary.stats.postgresConnectivity
                    ? 'Usage and run outcome signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-slo-list">
              {sloAdminSummary.records.map((record) => (
                <article
                  className={`workspace-slo-card workspace-slo-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatSloDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {sloAdminSummary.availableActions.includes('refresh_slo_summary') ? (
              <button
                className="secondary-button"
                type="button"
                disabled={sloAdminAction !== 'idle'}
                onClick={() =>
                  void handleSloAdminAction('refresh_slo_summary')
                }
              >
                {formatSloAdminAction('refresh_slo_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {capacityAdminSummary ? (
          <div className="billing-admin workspace-capacity-admin">
            <div className="billing-admin__header">
              <span>Capacity admin</span>
              <strong>{capacityAdminSummary.role}</strong>
            </div>
            <p>{capacityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Concurrent load</span>
                <strong>{capacityAdminSummary.stats.loadUtilizationPercent}%</strong>
                <small>
                  {capacityAdminSummary.stats.coveredDomains}/
                  {capacityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Capacity signals</span>
                <strong>{capacityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {capacityAdminSummary.stats.postgresConnectivity
                    ? 'Run load and usage limit signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-capacity-list">
              {capacityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-capacity-card workspace-capacity-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatCapacityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {capacityAdminSummary.availableActions.includes(
              'refresh_capacity_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={capacityAdminAction !== 'idle'}
                onClick={() =>
                  void handleCapacityAdminAction('refresh_capacity_summary')
                }
              >
                {formatCapacityAdminAction('refresh_capacity_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {performanceAdminSummary ? (
          <div className="billing-admin workspace-performance-admin">
            <div className="billing-admin__header">
              <span>Performance admin</span>
              <strong>{performanceAdminSummary.role}</strong>
            </div>
            <p>{performanceAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Average latency</span>
                <strong>{performanceAdminSummary.stats.averageLatencyMs}ms</strong>
                <small>
                  {performanceAdminSummary.stats.latencySignalPercent}% latency
                  signal coverage
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Performance signals</span>
                <strong>{performanceAdminSummary.stats.totalRecords}</strong>
                <small>
                  {performanceAdminSummary.stats.postgresConnectivity
                    ? `${performanceAdminSummary.stats.coveredDomains}/${performanceAdminSummary.stats.totalDomains} domains covered`
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-performance-list">
              {performanceAdminSummary.records.map((record) => (
                <article
                  className={`workspace-performance-card workspace-performance-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatPerformanceDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {performanceAdminSummary.availableActions.includes(
              'refresh_performance_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={performanceAdminAction !== 'idle'}
                onClick={() =>
                  void handlePerformanceAdminAction('refresh_performance_summary')
                }
              >
                {formatPerformanceAdminAction('refresh_performance_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {resilienceAdminSummary ? (
          <div className="billing-admin workspace-resilience-admin">
            <div className="billing-admin__header">
              <span>Resilience admin</span>
              <strong>{resilienceAdminSummary.role}</strong>
            </div>
            <p>{resilienceAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Recovery readiness</span>
                <strong>
                  {resilienceAdminSummary.stats.recoveryReadinessPercent}%
                </strong>
                <small>
                  {resilienceAdminSummary.stats.coveredDomains}/
                  {resilienceAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Resilience signals</span>
                <strong>{resilienceAdminSummary.stats.totalRecords}</strong>
                <small>
                  {resilienceAdminSummary.stats.postgresConnectivity
                    ? 'Run workflow and migration recovery signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-resilience-list">
              {resilienceAdminSummary.records.map((record) => (
                <article
                  className={`workspace-resilience-card workspace-resilience-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatResilienceDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {resilienceAdminSummary.availableActions.includes(
              'refresh_resilience_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={resilienceAdminAction !== 'idle'}
                onClick={() =>
                  void handleResilienceAdminAction('refresh_resilience_summary')
                }
              >
                {formatResilienceAdminAction('refresh_resilience_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {availabilityAdminSummary ? (
          <div className="billing-admin workspace-availability-admin">
            <div className="billing-admin__header">
              <span>Availability admin</span>
              <strong>{availabilityAdminSummary.role}</strong>
            </div>
            <p>{availabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run availability</span>
                <strong>{availabilityAdminSummary.stats.availabilityPercent}%</strong>
                <small>
                  {availabilityAdminSummary.stats.coveredDomains}/
                  {availabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Availability signals</span>
                <strong>{availabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {availabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcome and usage availability signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-availability-list">
              {availabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-availability-card workspace-availability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatAvailabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {availabilityAdminSummary.availableActions.includes(
              'refresh_availability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={availabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleAvailabilityAdminAction('refresh_availability_summary')
                }
              >
                {formatAvailabilityAdminAction('refresh_availability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {reliabilityAdminSummary ? (
          <div className="billing-admin workspace-reliability-admin">
            <div className="billing-admin__header">
              <span>Reliability admin</span>
              <strong>{reliabilityAdminSummary.role}</strong>
            </div>
            <p>{reliabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run reliability</span>
                <strong>{reliabilityAdminSummary.stats.reliabilityPercent}%</strong>
                <small>
                  {reliabilityAdminSummary.stats.coveredDomains}/
                  {reliabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Reliability signals</span>
                <strong>{reliabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {reliabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, idempotency, and model health signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-reliability-list">
              {reliabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-reliability-card workspace-reliability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatReliabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {reliabilityAdminSummary.availableActions.includes(
              'refresh_reliability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={reliabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleReliabilityAdminAction('refresh_reliability_summary')
                }
              >
                {formatReliabilityAdminAction('refresh_reliability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {stabilityAdminSummary ? (
          <div className="billing-admin workspace-stability-admin">
            <div className="billing-admin__header">
              <span>Stability admin</span>
              <strong>{stabilityAdminSummary.role}</strong>
            </div>
            <p>{stabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run stability</span>
                <strong>{stabilityAdminSummary.stats.stabilityPercent}%</strong>
                <small>
                  {stabilityAdminSummary.stats.coveredDomains}/
                  {stabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Stability signals</span>
                <strong>{stabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {stabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, artifacts, and migration signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-stability-list">
              {stabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-stability-card workspace-stability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatStabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {stabilityAdminSummary.availableActions.includes(
              'refresh_stability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={stabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleStabilityAdminAction('refresh_stability_summary')
                }
              >
                {formatStabilityAdminAction('refresh_stability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {consistencyAdminSummary ? (
          <div className="billing-admin workspace-consistency-admin">
            <div className="billing-admin__header">
              <span>Consistency admin</span>
              <strong>{consistencyAdminSummary.role}</strong>
            </div>
            <p>{consistencyAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run consistency</span>
                <strong>
                  {consistencyAdminSummary.stats.consistencyPercent}%
                </strong>
                <small>
                  {consistencyAdminSummary.stats.coveredDomains}/
                  {consistencyAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Consistency signals</span>
                <strong>{consistencyAdminSummary.stats.totalRecords}</strong>
                <small>
                  {consistencyAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, workflows, and idempotency signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-consistency-list">
              {consistencyAdminSummary.records.map((record) => (
                <article
                  className={`workspace-consistency-card workspace-consistency-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatConsistencyDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {consistencyAdminSummary.availableActions.includes(
              'refresh_consistency_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={consistencyAdminAction !== 'idle'}
                onClick={() =>
                  void handleConsistencyAdminAction(
                    'refresh_consistency_summary',
                  )
                }
              >
                {formatConsistencyAdminAction('refresh_consistency_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {integrityAdminSummary ? (
          <div className="billing-admin workspace-integrity-admin">
            <div className="billing-admin__header">
              <span>Integrity admin</span>
              <strong>{integrityAdminSummary.role}</strong>
            </div>
            <p>{integrityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run integrity</span>
                <strong>{integrityAdminSummary.stats.integrityPercent}%</strong>
                <small>
                  {integrityAdminSummary.stats.coveredDomains}/
                  {integrityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Integrity signals</span>
                <strong>{integrityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {integrityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, artifacts, and shield scan signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-integrity-list">
              {integrityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-integrity-card workspace-integrity-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatIntegrityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {integrityAdminSummary.availableActions.includes(
              'refresh_integrity_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={integrityAdminAction !== 'idle'}
                onClick={() =>
                  void handleIntegrityAdminAction('refresh_integrity_summary')
                }
              >
                {formatIntegrityAdminAction('refresh_integrity_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {durabilityAdminSummary ? (
          <div className="billing-admin workspace-durability-admin">
            <div className="billing-admin__header">
              <span>Durability admin</span>
              <strong>{durabilityAdminSummary.role}</strong>
            </div>
            <p>{durabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Artifact durability</span>
                <strong>
                  {durabilityAdminSummary.stats.durabilityPercent}%
                </strong>
                <small>
                  {durabilityAdminSummary.stats.coveredDomains}/
                  {durabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Durability signals</span>
                <strong>{durabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {durabilityAdminSummary.stats.postgresConnectivity
                    ? 'Artifacts, usage events, and idempotency signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-durability-list">
              {durabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-durability-card workspace-durability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatDurabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {durabilityAdminSummary.availableActions.includes(
              'refresh_durability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={durabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleDurabilityAdminAction('refresh_durability_summary')
                }
              >
                {formatDurabilityAdminAction('refresh_durability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {recoverabilityAdminSummary ? (
          <div className="billing-admin workspace-recoverability-admin">
            <div className="billing-admin__header">
              <span>Recoverability admin</span>
              <strong>{recoverabilityAdminSummary.role}</strong>
            </div>
            <p>{recoverabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run recoverability</span>
                <strong>
                  {recoverabilityAdminSummary.stats.recoverabilityPercent}%
                </strong>
                <small>
                  {recoverabilityAdminSummary.stats.coveredDomains}/
                  {recoverabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Recovery signals</span>
                <strong>{recoverabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {recoverabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, workflows, and recovery signals'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-recoverability-list">
              {recoverabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-recoverability-card workspace-recoverability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatRecoverabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {recoverabilityAdminSummary.availableActions.includes(
              'refresh_recoverability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={recoverabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleRecoverabilityAdminAction(
                    'refresh_recoverability_summary',
                  )
                }
              >
                {formatRecoverabilityAdminAction(
                  'refresh_recoverability_summary',
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        {maintainabilityAdminSummary ? (
          <div className="billing-admin workspace-maintainability-admin">
            <div className="billing-admin__header">
              <span>Maintainability admin</span>
              <strong>{maintainabilityAdminSummary.role}</strong>
            </div>
            <p>{maintainabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run maintainability</span>
                <strong>
                  {maintainabilityAdminSummary.stats.maintainabilityPercent}%
                </strong>
                <small>
                  {maintainabilityAdminSummary.stats.coveredDomains}/
                  {maintainabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Maintainability signals</span>
                <strong>{maintainabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {maintainabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, model health, and usage telemetry'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-maintainability-list">
              {maintainabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-maintainability-card workspace-maintainability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatMaintainabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {maintainabilityAdminSummary.availableActions.includes(
              'refresh_maintainability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={maintainabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleMaintainabilityAdminAction(
                    'refresh_maintainability_summary',
                  )
                }
              >
                {formatMaintainabilityAdminAction(
                  'refresh_maintainability_summary',
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        {scalabilityAdminSummary ? (
          <div className="billing-admin workspace-scalability-admin">
            <div className="billing-admin__header">
              <span>Scalability admin</span>
              <strong>{scalabilityAdminSummary.role}</strong>
            </div>
            <p>{scalabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Run scalability</span>
                <strong>
                  {scalabilityAdminSummary.stats.scalabilityPercent}%
                </strong>
                <small>
                  {scalabilityAdminSummary.stats.coveredDomains}/
                  {scalabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Scalability signals</span>
                <strong>{scalabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {scalabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run load, usage events, and membership growth'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-scalability-list">
              {scalabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-scalability-card workspace-scalability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatScalabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {scalabilityAdminSummary.availableActions.includes(
              'refresh_scalability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={scalabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleScalabilityAdminAction('refresh_scalability_summary')
                }
              >
                {formatScalabilityAdminAction('refresh_scalability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {traceabilityAdminSummary ? (
          <div className="billing-admin workspace-traceability-admin">
            <div className="billing-admin__header">
              <span>Traceability admin</span>
              <strong>{traceabilityAdminSummary.role}</strong>
            </div>
            <p>{traceabilityAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Artifact lineage</span>
                <strong>
                  {traceabilityAdminSummary.stats.traceabilityPercent}%
                </strong>
                <small>
                  {traceabilityAdminSummary.stats.coveredDomains}/
                  {traceabilityAdminSummary.stats.totalDomains} domains covered
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Traceability signals</span>
                <strong>{traceabilityAdminSummary.stats.totalRecords}</strong>
                <small>
                  {traceabilityAdminSummary.stats.postgresConnectivity
                    ? 'Run outcomes, artifacts, and usage events'
                    : 'PostgreSQL unavailable'}
                </small>
              </article>
            </div>
            <div className="workspace-traceability-list">
              {traceabilityAdminSummary.records.map((record) => (
                <article
                  className={`workspace-traceability-card workspace-traceability-card--${record.tableExists ? 'ready' : 'missing'}`}
                  key={record.domain}
                >
                  <div>
                    <strong>{formatTraceabilityDomain(record.domain)}</strong>
                    <p>{record.tableName}</p>
                    <small>
                      {record.tableExists
                        ? `${record.recordCount} record(s)`
                        : 'Table missing'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {traceabilityAdminSummary.availableActions.includes(
              'refresh_traceability_summary',
            ) ? (
              <button
                className="secondary-button"
                type="button"
                disabled={traceabilityAdminAction !== 'idle'}
                onClick={() =>
                  void handleTraceabilityAdminAction(
                    'refresh_traceability_summary',
                  )
                }
              >
                {formatTraceabilityAdminAction('refresh_traceability_summary')}
              </button>
            ) : null}
          </div>
        ) : null}

        {memberAdminSummary ? (
          <div className="billing-admin workspace-member-admin">
            <div className="billing-admin__header">
              <span>Member admin tools</span>
              <strong>{memberAdminSummary.role}</strong>
            </div>
            <p>{memberAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Members</span>
                <strong>{memberAdminSummary.stats.memberCount}</strong>
                <small>{memberAdminSummary.stats.ownerCount} owners</small>
              </article>
              <article className="billing-admin-stat">
                <span>Admins</span>
                <strong>{memberAdminSummary.stats.adminCount}</strong>
                <small>Role-managed access</small>
              </article>
            </div>
            <div className="workspace-member-list">
              {memberAdminSummary.members.map((member) => (
                <article className="workspace-member-card" key={member.userId}>
                  <div>
                    <strong>{member.userId}</strong>
                    <p>{formatWorkspaceRole(member.role)}</p>
                    {member.email ? <small>{member.email}</small> : null}
                  </div>
                  <div className="workspace-member-card__actions">
                    {memberAdminSummary.availableActions.includes(
                      'update_member_role',
                    ) && member.role !== 'owner' ? (
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={memberAdminAction !== 'idle'}
                        onClick={() =>
                          void handleMemberAdminAction({
                            action: 'update_member_role',
                            userId: member.userId,
                            role: 'admin',
                          })
                        }
                      >
                        Make admin
                      </button>
                    ) : null}
                    {memberAdminSummary.availableActions.includes(
                      'remove_member',
                    ) ? (
                      <button
                        className="danger-button"
                        type="button"
                        disabled={memberAdminAction !== 'idle'}
                        onClick={() =>
                          void handleMemberAdminAction({
                            action: 'remove_member',
                            userId: member.userId,
                          })
                        }
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
            {memberAdminSummary.availableActions.includes('add_member') ? (
              <form
                className="workspace-member-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!newMemberForm.userId.trim()) {
                    return
                  }
                  void handleMemberAdminAction({
                    action: 'add_member',
                    userId: newMemberForm.userId.trim(),
                    role: newMemberForm.role,
                    email: newMemberForm.email.trim() || undefined,
                  })
                }}
              >
                <label>
                  User id
                  <input
                    value={newMemberForm.userId}
                    onChange={(event) =>
                      setNewMemberForm((current) => ({
                        ...current,
                        userId: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Role
                  <select
                    value={newMemberForm.role}
                    onChange={(event) =>
                      setNewMemberForm((current) => ({
                        ...current,
                        role: event.target.value as typeof current.role,
                      }))
                    }
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>
                <label>
                  Email
                  <input
                    value={newMemberForm.email}
                    onChange={(event) =>
                      setNewMemberForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </label>
                <button
                  type="submit"
                  disabled={
                    memberAdminAction !== 'idle' || !newMemberForm.userId.trim()
                  }
                >
                  Add test member
                </button>
              </form>
            ) : null}
            <div className="workspace-audit-export">
              <span>Workspace audit export</span>
              <div className="billing-export-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={billingAction !== 'idle' || memberAdminAction !== 'idle'}
                  onClick={() => void handleExportWorkspaceAudit('csv')}
                >
                  Export audit CSV
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={billingAction !== 'idle' || memberAdminAction !== 'idle'}
                  onClick={() => void handleExportWorkspaceAudit('json')}
                >
                  Export audit JSON
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {billingCapabilities?.supportsMeteredUsage ? (
          <div className="billing-meter-usage">
            <span>Metered usage reports</span>
            {billingMeterUsageReports.length ? (
              billingMeterUsageReports.map((report) => (
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

        {billingCapabilities?.supportsBillingNotifications ? (
          <div className="billing-notifications">
            <span>Notification delivery</span>
            {billingNotifications.length ? (
              billingNotifications.map((notification) => (
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

        {billingCapabilities?.supportsBillingAdminTools &&
        billingAdminSummary ? (
          <div className="billing-admin">
            <div className="billing-admin__header">
              <span>Billing admin tools</span>
              <strong>{billingAdminSummary.role}</strong>
            </div>
            <p>{billingAdminSummary.guidance}</p>
            <div className="billing-admin__stats">
              <article className="billing-admin-stat">
                <span>Alerts</span>
                <strong>{billingAdminSummary.stats.alertCount}</strong>
                <small>
                  {billingAdminSummary.stats.criticalAlertCount} critical
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Invoices</span>
                <strong>{billingAdminSummary.stats.invoiceCount}</strong>
                <small>
                  ${billingAdminSummary.stats.paidInvoiceTotalUsd.toFixed(2)} paid
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Webhooks</span>
                <strong>{billingAdminSummary.stats.webhookEventCount}</strong>
                <small>
                  {billingAdminSummary.stats.failedWebhookEventCount} failed
                </small>
              </article>
              <article className="billing-admin-stat">
                <span>Notifications</span>
                <strong>{billingAdminSummary.stats.notificationCount}</strong>
                <small>
                  {billingAdminSummary.stats.failedNotificationCount} failed
                </small>
              </article>
            </div>
            {billingAdminSummary.availableActions.length ? (
              <div className="billing-admin__actions">
                {billingAdminSummary.availableActions.map((action) => (
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
                    onClick={() => void handleBillingAdminAction(action)}
                  >
                    {formatBillingAdminAction(action)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {billingCapabilities?.supportsWebhookAudit ? (
          <div className="billing-webhook-events">
            <span>Recent webhook events</span>
            {billingWebhookEvents.length ? (
              billingWebhookEvents.map((event) => (
                <article className="billing-webhook-event" key={event.billingWebhookEventId}>
                  <strong>{event.eventType}</strong>
                  <p>
                    {event.status} · {event.externalEventId}
                  </p>
                  <small>{new Date(event.receivedAt).toLocaleString()}</small>
                </article>
              ))
            ) : (
              <p className="clear-copy">No webhook events recorded for this workspace yet.</p>
            )}
          </div>
        ) : null}

        {billingCapabilities?.supportsInvoiceHistory ? (
          <div className="billing-invoice-history">
            <div className="billing-invoice-history__header">
              <span>Invoice history</span>
              {billingCapabilities.supportsBillingExport ? (
                <div className="billing-export-actions">
                  <button
                    type="button"
                    onClick={() => handleExportBillingInvoices('csv')}
                    disabled={billingAction !== 'idle'}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportBillingInvoices('json')}
                    disabled={billingAction !== 'idle'}
                  >
                    Export JSON
                  </button>
                </div>
              ) : null}
            </div>
            {billingInvoices.length ? (
              billingInvoices.map((invoice) => (
                <article className="billing-invoice-card" key={invoice.billingInvoiceId}>
                  <div>
                    <strong>
                      {formatInvoiceAmount(invoice.amountTotalUsd, invoice.currency)}
                    </strong>
                    <p>
                      {formatInvoiceStatus(invoice.status)}
                      {invoice.paidTier
                        ? ` · ${formatPaidTier(invoice.paidTier)}`
                        : ''}
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
      </section>

      {draftRun && reviewDraft ? (
        <section className="panel review-panel">
          <div className="section-heading">
            <p className="eyebrow">Human Review</p>
            <h2>Approve the plan before execution.</h2>
            <p>
              Draft state is autosaved locally. Review Shield context, triage,
              selected agents, and estimated run cost before execution.
            </p>
          </div>

          <div className="review-grid">
            <div className="review-card">
              <span>Input with Shield context</span>
              <div
                className={`shield-warning-card shield-warning-card--${draftRun.shieldScan.status}`}
              >
                <strong>
                  Shield {draftRun.shieldScan.status}:{' '}
                  {getSeverityLabel(draftRun.shieldScan.maxSeverity)}
                </strong>
                <p>
                  {draftRun.shieldScan.findings.length > 0
                    ? `${draftRun.shieldScan.findings.length} finding(s) require review before execution.`
                    : 'No meaningful findings. Shield stays quiet and the run can proceed.'}
                </p>
              </div>
              <p className="review-idea">
                {getHighlightedIdea(draftRun.idea.rawIdea, draftRun.shieldScan.findings)}
              </p>
              {draftRun.shieldScan.findings.length > 0 ? (
                <>
                  <div className="finding-tabs" aria-label="Shield findings">
                    {draftRun.shieldScan.findings.map((finding) => (
                      <button
                        className={
                          finding.findingId === activeFinding?.findingId
                            ? 'finding-tab finding-tab--active'
                            : 'finding-tab'
                        }
                        key={finding.findingId}
                        type="button"
                        onClick={() => setActiveFindingId(finding.findingId)}
                      >
                        {finding.category}
                      </button>
                    ))}
                  </div>
                  {activeFinding ? (
                    <div className="finding-detail">
                      <strong>
                        {activeFinding.category} · {activeFinding.severity}
                      </strong>
                      <p>{activeFinding.explanation}</p>
                      <small>Recommended action: {activeFinding.recommendedAction}</small>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="clear-copy">No meaningful Shield findings.</p>
              )}
            </div>

            <div className="review-card">
              <span>Editable triage metadata</span>
              <div className="field-grid">
                <label>
                  Domain
                  <select
                    value={reviewDraft.triage.domain}
                    onChange={(event) =>
                      updateReviewTriage('domain', event.target.value)
                    }
                  >
                    {domainOptions.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Complexity
                  <select
                    value={reviewDraft.triage.complexity}
                    onChange={(event) =>
                      updateReviewTriage(
                        'complexity',
                        event.target.value as DraftRun['triage']['complexity'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Market confidence
                  <select
                    value={reviewDraft.triage.marketConfidence}
                    onChange={(event) =>
                      updateReviewTriage(
                        'marketConfidence',
                        event.target
                          .value as DraftRun['triage']['marketConfidence'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Security sensitivity
                  <select
                    value={reviewDraft.triage.securitySensitivity}
                    onChange={(event) =>
                      updateReviewTriage(
                        'securitySensitivity',
                        event.target
                          .value as DraftRun['triage']['securitySensitivity'],
                      )
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <div className="triage-rationale">
                <strong>Why this routing?</strong>
                <p>{reviewDraft.triage.reasoningSummary}</p>
              </div>
            </div>
          </div>

          <div className="review-card">
            <span>Selected agents</span>
            <div className="agent-selection-summary">
              <strong>{selectedAgentCount} selected</strong>
              <span>{selectedSpecialistCount} specialists + Moderator</span>
              <span>{reviewDraft.triage.recommendedRunMode} run mode</span>
            </div>
            <div className="agent-toggle-list">
              {agentOptions.map((agent) => (
                <label
                  key={agent}
                  className={
                    reviewDraft.selectedAgents.includes(agent)
                      ? 'agent-toggle agent-toggle--selected'
                      : 'agent-toggle'
                  }
                >
                  <input
                    type="checkbox"
                    checked={reviewDraft.selectedAgents.includes(agent)}
                    onChange={() => toggleAgent(agent)}
                  />
                  {formatAgent(agent)}
                </label>
              ))}
            </div>
            <div className="agent-rationale-grid">
              {reviewDraft.selectedAgents.map((agent) => (
                <article className="agent-rationale-card" key={agent}>
                  <strong>{formatAgent(agent)}</strong>
                  <p>{agentCatalog[agent]?.rationale ?? 'Selected for this run.'}</p>
                  {reviewDraft.triage.recommendedAgents.includes(agent) ? (
                    <small>Recommended by triage</small>
                  ) : (
                    <small>Added during human review</small>
                  )}
                </article>
              ))}
            </div>
            <div className="estimate-row">
              <span>{reviewDraft.triage.estimatedDurationSeconds}s estimate</span>
              <span>${reviewDraft.triage.estimatedMaxCostUsd.toFixed(2)} max cost</span>
              <span>{reviewDraft.triage.complexity} complexity</span>
              <span>{reviewDraft.triage.securitySensitivity} security</span>
            </div>
            <button
              className="execute-button"
              type="button"
              disabled={
                pipelineState === 'running' || reviewDraft.selectedAgents.length < 3
              }
              onClick={handleExecuteApprovedRun}
            >
              {pipelineState === 'running'
                ? useTemporalWorkflowRuntime
                  ? 'Starting Temporal workflow...'
                  : 'Executing prompt-driven pipeline...'
                : useTemporalWorkflowRuntime
                  ? 'Execute with Temporal workflow'
                  : 'Execute prompt-driven pipeline'}
            </button>
            {showResumeTemporalObservation && activeTemporalWorkflow ? (
              <button
                className="secondary-button"
                type="button"
                disabled={pipelineState === 'running'}
                onClick={() => handleResumeTemporalWorkflow(activeTemporalWorkflow)}
              >
                Resume observation
              </button>
            ) : null}
            {useTemporalWorkflowRuntime ? (
              <p className="runtime-note">
                {approvedRunRuntimeLabel}. Make sure `TEMPORAL_ENABLED=true`
                and the worker are running.
              </p>
            ) : (
              <p className="runtime-note">{approvedRunRuntimeLabel}</p>
            )}
            {temporalRuntimeHealth && temporalRuntimeHealth.status !== 'healthy' ? (
              <p className="form-error">{temporalRuntimeHealth.guidance}</p>
            ) : null}
            {temporalRuntimeHealth?.status === 'healthy' ? (
              <p className="runtime-note">{temporalRuntimeHealth.guidance}</p>
            ) : null}
            {temporalRecoveryHint ? (
              <p className="runtime-note">{temporalRecoveryHint}</p>
            ) : null}
            {pipelineError ? <p className="form-error">{pipelineError}</p> : null}
          </div>
        </section>
      ) : null}

      {pipelineResult || streamEvents.length > 0 ? (
        <section className="panel results-panel">
          <div className="section-heading">
            <p className="eyebrow">Pipeline Result</p>
            <h2>
              {pipelineState === 'running'
                ? useTemporalWorkflowRuntime
                  ? 'Observing Temporal workflow...'
                  : 'Streaming run status...'
                : 'Artifacts generated from isolated prompt-driven agents.'}
            </h2>
            {activeTemporalWorkflow ? (
              <p>
                Workflow {activeTemporalWorkflow.workflowId} is{' '}
                {activeTemporalWorkflow.status}.
              </p>
            ) : null}
          </div>

          <div className="step-list">
            {displayedSteps.map((step) => (
              <div className="step-item" key={`${step.stepId}-${step.status}`}>
                <span>{step.label}</span>
                <strong>{step.status}</strong>
              </div>
            ))}
          </div>

          {pipelineResult ? (
            <div className="agent-result-grid">
              {pipelineResult.agentOutputs.map((agentOutput) => (
                <article className="agent-card" key={agentOutput.agentRole}>
                  <h3>{formatAgent(agentOutput.agentRole)}</h3>
                  <p>{agentOutput.output.summary}</p>
                  <div className="metadata-row">
                    <span>{agentOutput.validationStatus}</span>
                    <span>{agentOutput.modelProvider}</span>
                    <span>{agentOutput.inputTokens + agentOutput.outputTokens} tokens</span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {visibleArtifacts.length > 0 ? (
            <div className="artifact-viewer">
              <div className="artifact-tabs" aria-label="Generated artifacts">
                {visibleArtifacts.map((artifact) => (
                  <button
                    className={
                      artifact.metadata.artifactType === activeArtifactType
                        ? 'artifact-tab artifact-tab--active'
                        : 'artifact-tab'
                    }
                    key={artifact.metadata.artifactType}
                    type="button"
                    onClick={() => setActiveArtifactType(artifact.metadata.artifactType)}
                  >
                    {formatArtifactTitle(artifact.metadata.artifactType)}
                  </button>
                ))}
              </div>

              {selectedArtifact ? (
                <article className="artifact-card">
                  <div className="artifact-card-header">
                    <span>{formatArtifactTitle(selectedArtifact.metadata.artifactType)}</span>
                    <div className="metadata-row">
                      <span>{selectedArtifact.metadata.validationStatus}</span>
                      <span>{selectedArtifact.metadata.modelProvider}</span>
                      <span>{selectedArtifact.metadata.shieldStatus} shield</span>
                      <span>
                        {selectedArtifact.metadata.tokenUsage.inputTokens +
                          selectedArtifact.metadata.tokenUsage.outputTokens}{' '}
                        tokens
                      </span>
                    </div>
                  </div>
                  <p className="prompt-version">
                    Prompt version: {selectedArtifact.metadata.promptVersion}
                  </p>
                  {Object.entries(selectedArtifact.artifact.content).map(([key, value]) => (
                    <div className="artifact-section" key={key}>
                      <strong>{formatAgent(key)}</strong>
                      {renderArtifactValue(value)}
                    </div>
                  ))}
                </article>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="panel history-panel">
        <div className="section-heading">
          <p className="eyebrow">Artifact History</p>
          <h2>Durable artifacts from previous runs.</h2>
          <p>
            History is workspace-scoped. Each artifact is immutable and can be
            exported as Markdown from its persisted content.
          </p>
        </div>
        <button
          className="execute-button"
          type="button"
          onClick={handleLoadArtifactHistory}
        >
          Load artifact history
        </button>
        {historyError ? <p className="form-error">{historyError}</p> : null}
        {artifactHistory.length > 0 ? (
          <div className="history-list">
            {artifactHistory.map((artifact) => (
              <article className="history-item" key={artifact.artifactId}>
                <div>
                  <strong>{formatArtifactTitle(artifact.artifactType)}</strong>
                  <p>
                    Run {artifact.runId} - version {artifact.artifactVersion}
                  </p>
                  <small>{new Date(artifact.createdAt).toLocaleString()}</small>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleExportMarkdown(artifact.artifactId)}
                >
                  Export Markdown
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel" id="pipeline">
        <div className="section-heading">
          <p className="eyebrow">Pipeline</p>
          <h2>Structured, resumable, and guarded.</h2>
        </div>
        <ol className="pipeline-list">
          {pipelineSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="grid-section">
        <div className="panel">
          <p className="eyebrow">Agent model</p>
          <h2>Parallel experts, no endless debate.</h2>
          <div className="agent-list">
            {agentCards.map((agent) => (
              <article className="agent-card" key={agent.title}>
                <h3>{agent.title}</h3>
                <p>{agent.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel shield-panel">
          <p className="eyebrow">Shield layer</p>
          <h2>Security stays quiet until it matters.</h2>
          <p>
            Shield scans user input, agent output, moderator synthesis, and
            final artifacts. Findings are shown as compact warnings with exact
            text highlights, while low-risk checks stay in the background.
          </p>
          <div className="finding-preview">
            <span>Example finding</span>
            <mark>ignore previous instructions</mark>
            <p>Prompt injection pattern detected. Require confirmation.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
